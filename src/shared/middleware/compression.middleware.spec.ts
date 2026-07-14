import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
import { CompressionMiddleware, compressionFactory } from './compression.middleware';

describe('CompressionMiddleware', () => {
  let middleware: CompressionMiddleware;
  let configService: { get: jest.Mock };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;
  let compressionMiddlewareFn: jest.Mock;
  let createSpy: jest.SpyInstance;

  beforeEach(async () => {
    compressionMiddlewareFn = jest.fn((_req, _res, next) => next());
    createSpy = jest
      .spyOn(compressionFactory, 'create')
      .mockImplementation(() => compressionMiddlewareFn as never);

    configService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompressionMiddleware,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    middleware = module.get<CompressionMiddleware>(CompressionMiddleware);

    mockRequest = {
      path: '/page',
      headers: {},
    };
    mockResponse = {
      getHeader: jest.fn().mockReturnValue(undefined),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    createSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should cover decorator metadata fallback when ConfigService is not a function', () => {
    createSpy.mockRestore();
    jest.isolateModules(() => {
      jest.doMock('@nestjs/config', () => ({
        ConfigService: { notAConstructor: true },
      }));

      const { CompressionMiddleware: Reloaded } = require('./compression.middleware');
      expect(Reloaded).toBeDefined();
    });
    createSpy = jest
      .spyOn(compressionFactory, 'create')
      .mockImplementation(() => compressionMiddlewareFn as never);
  });

  it('should use configured compression options when present', () => {
    const configuredOptions = { level: 9, threshold: 2048 };
    configService.get.mockReturnValue(configuredOptions);

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(configService.get).toHaveBeenCalledWith('performance.compression');
    expect(createSpy).toHaveBeenCalledWith(configuredOptions);
    expect(compressionMiddlewareFn).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
  });

  it('should fall back to default options when config is missing', () => {
    configService.get.mockReturnValue(undefined);

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 6,
        threshold: 1024,
        filter: expect.any(Function),
      })
    );
    expect(compressionMiddlewareFn).toHaveBeenCalled();
  });

  describe('default filter', () => {
    let filter: (req: Request, res: Response) => boolean;

    beforeEach(() => {
      configService.get.mockReturnValue(undefined);
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      filter = createSpy.mock.calls[0][0].filter;
    });

    it('should skip compression when x-no-compression header is set', () => {
      mockRequest.headers = { 'x-no-compression': '1' };
      mockRequest.path = '/page.html';

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(false);
    });

    it('should skip compression for binary file extensions', () => {
      mockRequest.headers = {};
      mockRequest.path = '/images/photo.jpg';

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(false);
    });

    it.each([
      '.jpeg',
      '.png',
      '.gif',
      '.svg',
      '.ico',
      '.webp',
      '.avif',
      '.bmp',
      '.tiff',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
      '.otf',
      '.mp4',
      '.mp3',
      '.wav',
      '.avi',
      '.mov',
      '.pdf',
      '.zip',
      '.gz',
      '.tar',
      '.rar',
      '.7z',
    ])('should skip compression for %s paths', (ext) => {
      mockRequest.headers = {};
      mockRequest.path = `/asset/file${ext}`;

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(false);
    });

    it('should skip compression for binary MIME types', () => {
      mockRequest.headers = {};
      mockRequest.path = '/download';
      mockResponse.getHeader = jest.fn().mockReturnValue('image/png');

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(false);
    });

    it.each([
      'video/mp4',
      'audio/mpeg',
      'application/pdf',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'font/woff2',
      'application/font-woff',
      'application/font-woff2',
    ])('should skip compression for MIME type %s', (mime) => {
      mockRequest.headers = {};
      mockRequest.path = '/download';
      mockResponse.getHeader = jest.fn().mockReturnValue(mime);

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(false);
    });

    it('should allow compression for text content', () => {
      mockRequest.headers = {};
      mockRequest.path = '/page';
      mockResponse.getHeader = jest.fn().mockReturnValue('text/html');

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(true);
    });

    it('should allow compression when content-type header is missing', () => {
      mockRequest.headers = {};
      mockRequest.path = '/api/data';
      mockResponse.getHeader = jest.fn().mockReturnValue(undefined);

      expect(filter(mockRequest as Request, mockResponse as Response)).toBe(true);
    });
  });
});
