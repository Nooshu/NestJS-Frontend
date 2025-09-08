import { Test, TestingModule } from '@nestjs/testing';
import { StaticAssetsMiddleware } from './static-assets.middleware';
import { AssetFingerprintService } from '../services/asset-fingerprint.service';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { existsSync } from 'fs';

// Mock the fs modules
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
}));

// Mock the performance config
jest.mock('../config/performance.config', () => ({
  performanceConfig: {
    staticAssets: {
      maxAge: 31536000,
      immutable: true,
      etag: true,
      lastModified: true,
      setHeaders: jest.fn(),
    },
  },
}));

describe('StaticAssetsMiddleware', () => {
  let middleware: StaticAssetsMiddleware;
  let assetFingerprintService: AssetFingerprintService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
  const mockStat = stat as jest.MockedFunction<typeof stat>;
  const mockCreateReadStream = createReadStream as jest.MockedFunction<typeof createReadStream>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticAssetsMiddleware,
        {
          provide: AssetFingerprintService,
          useValue: {
            getHashedPath: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<StaticAssetsMiddleware>(StaticAssetsMiddleware);
    assetFingerprintService = module.get<AssetFingerprintService>(AssetFingerprintService);

    // Reset mocks
    mockRequest = {
      method: 'GET',
      path: '/test.css',
    };
    mockResponse = {
      redirect: jest.fn(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('Non-GET requests', () => {
    it('should call next() for POST requests', async () => {
      mockRequest.method = 'POST';
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(assetFingerprintService.getHashedPath).not.toHaveBeenCalled();
    });

    it('should call next() for PUT requests', async () => {
      mockRequest.method = 'PUT';
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(assetFingerprintService.getHashedPath).not.toHaveBeenCalled();
    });

    it('should call next() for DELETE requests', async () => {
      mockRequest.method = 'DELETE';
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(assetFingerprintService.getHashedPath).not.toHaveBeenCalled();
    });
  });

  describe('Hashed path redirect', () => {
    it('should redirect when hashed path differs from original path', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/styles.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/styles.abc123.css');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(assetFingerprintService.getHashedPath).toHaveBeenCalledWith('/styles.css');
      expect(mockResponse.redirect).toHaveBeenCalledWith('/styles.abc123.css');
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should not redirect when hashed path equals original path', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/styles.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/styles.css');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(assetFingerprintService.getHashedPath).toHaveBeenCalledWith('/styles.css');
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('File resolution', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/test.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/test.css');
    });

    it('should find file in src/public directory', async () => {
      mockExistsSync.mockImplementation((path: string) => {
        return path.includes('src/public');
      });
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400, immutable');
    });

    it('should find file in govuk-frontend dist directory', async () => {
      mockRequest.path = '/govuk/test.css';
      // Make sure the hashed path equals the original path so it doesn't redirect
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/govuk/test.css');
      mockExistsSync.mockImplementation((path: string) => {
        // The middleware will check paths like: /path/to/project/node_modules/govuk-frontend/dist/govuk/test.css
        return path.includes('node_modules/govuk-frontend/dist/govuk') && 
               !path.includes('assets') && 
               !path.includes('src/public');
      });
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).toHaveBeenCalled();
    });

    it('should find file in govuk-frontend assets directory', async () => {
      mockRequest.path = '/govuk/test.css';
      // Make sure the hashed path equals the original path so it doesn't redirect
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/govuk/test.css');
      mockExistsSync.mockImplementation((path: string) => {
        // The middleware will check paths like: /path/to/project/node_modules/govuk-frontend/dist/govuk/assets/test.css
        return path.includes('node_modules/govuk-frontend/dist/govuk/assets') && 
               !path.includes('src/public');
      });
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).toHaveBeenCalled();
    });

    it('should call next() when file is not found in any directory', async () => {
      mockExistsSync.mockReturnValue(false);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should call next() when found path is not a file', async () => {
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => false,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockStat).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('File serving with headers', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/test.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/test.css');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 2048,
        mtime: new Date('2023-01-01T12:00:00Z'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
    });

    it('should set correct cache headers', async () => {
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400, immutable');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', '"/test.css"');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Last-Modified', 'Sun, 01 Jan 2023 12:00:00 GMT');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 2048);
    });

    it('should set correct content type for CSS files', async () => {
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/css');
    });

    it('should set correct content type for JavaScript files', async () => {
      mockRequest.path = '/app.js';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/app.js');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/javascript');
    });

    it('should set correct content type for PNG images', async () => {
      mockRequest.path = '/logo.png';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/logo.png');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    });

    it('should set correct content type for JPEG images', async () => {
      mockRequest.path = '/photo.jpg';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/photo.jpg');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    });

    it('should set correct content type for SVG images', async () => {
      mockRequest.path = '/icon.svg';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/icon.svg');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    });

    it('should set correct content type for WOFF fonts', async () => {
      mockRequest.path = '/font.woff';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/font.woff');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'font/woff');
    });

    it('should set correct content type for WOFF2 fonts', async () => {
      mockRequest.path = '/font.woff2';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/font.woff2');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'font/woff2');
    });

    it('should set default content type for unknown file extensions', async () => {
      mockRequest.path = '/unknown.xyz';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/unknown.xyz');
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    });

    it('should stream the file using createReadStream', async () => {
      const mockStream = { pipe: jest.fn() };
      mockCreateReadStream.mockReturnValue(mockStream as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockCreateReadStream).toHaveBeenCalled();
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/test.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/test.css');
      mockExistsSync.mockReturnValue(true);
    });

    it('should call next with error when stat fails', async () => {
      const error = new Error('File system error');
      mockStat.mockRejectedValue(error);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(error);
    });

    it('should call next with error when createReadStream fails', async () => {
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      const error = new Error('Stream error');
      mockCreateReadStream.mockImplementation(() => {
        throw error;
      });
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty path', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('');
      mockExistsSync.mockReturnValue(false);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle path with no extension', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/file';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/file');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    });

    it('should handle path with multiple dots', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/file.min.js';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/file.min.js');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/javascript');
    });

    it('should handle uppercase file extensions', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/style.CSS';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/style.CSS');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/css');
    });

    it('should handle jpeg extension (both jpg and jpeg)', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/photo.jpeg';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/photo.jpeg');
      mockExistsSync.mockReturnValue(true);
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    });
  });

  describe('GOV.UK path handling', () => {
    it('should strip /govuk/ prefix when searching for files', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/govuk/assets/css/main.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/govuk/assets/css/main.css');
      
      mockExistsSync.mockImplementation((path: string) => {
        // Should search for 'assets/css/main.css' (without /govuk/ prefix)
        return path.includes('assets/css/main.css') && !path.includes('/govuk/');
      });
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).toHaveBeenCalled();
    });

    it('should not strip prefix for non-govuk paths', async () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/public/css/main.css';
      (assetFingerprintService.getHashedPath as jest.Mock).mockReturnValue('/public/css/main.css');
      
      mockExistsSync.mockImplementation((path: string) => {
        // Should search for the full path including /public/
        return path.includes('public/css/main.css');
      });
      mockStat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01'),
      } as any);
      mockCreateReadStream.mockReturnValue({ pipe: jest.fn() } as any);
      
      await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockStat).toHaveBeenCalled();
    });
  });
});
