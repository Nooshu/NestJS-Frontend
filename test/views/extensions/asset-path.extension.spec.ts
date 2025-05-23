import { Test, TestingModule } from '@nestjs/testing';
import { AssetPathExtension } from '../../../src/views/extensions/asset-path.extension';
import { FingerprintService } from '../../../src/shared/services/fingerprint.service';

describe('AssetPathExtension', () => {
  let extension: AssetPathExtension;
  let fingerprintService: FingerprintService;

  describe('constructor', () => {
    it('should create an instance with injected FingerprintService', () => {
      const mockFingerprintService = {
        getAssetPath: jest.fn(),
        // Add required properties from FingerprintService
        logger: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        manifest: {},
        manifestPath: '',
        publicDir: '',
        assetsDir: '',
        govukDir: '',
        fingerprint: jest.fn(),
        processFile: jest.fn(),
        processGovukFile: jest.fn(),
        processGovukAssetFile: jest.fn(),
        processGovukCssFile: jest.fn(),
        generateHash: jest.fn(),
        fingerprintFilename: jest.fn(),
      } as unknown as FingerprintService;

      const instance = new AssetPathExtension(mockFingerprintService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetPathExtension,
        {
          provide: FingerprintService,
          useValue: {
            getAssetPath: jest.fn(),
          },
        },
      ],
    }).compile();

    extension = module.get<AssetPathExtension>(AssetPathExtension);
    fingerprintService = module.get<FingerprintService>(FingerprintService);
  });

  describe('getName', () => {
    it('should return the correct extension name', () => {
      expect(extension.getName()).toBe('assetPath');
    });
  });

  describe('getExtension', () => {
    let assetPathFn: (assetPath: string) => string;

    beforeEach(() => {
      assetPathFn = extension.getExtension();
    });

    it('should return a function that resolves asset paths', () => {
      expect(typeof assetPathFn).toBe('function');
    });

    it('should call fingerprintService.getAssetPath with the provided path', () => {
      const mockPath = '/css/main.css';
      const mockFingerprintedPath = '/css/main.a1b2c3d4.css';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should return the original path if fingerprintService returns the same path', () => {
      const mockPath = '/images/logo.png';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockPath);
    });

    it('should handle paths with leading slashes', () => {
      const mockPath = 'css/main.css';
      const mockFingerprintedPath = '/css/main.a1b2c3d4.css';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should handle empty paths', () => {
      const mockPath = '';
      const mockFingerprintedPath = '';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should handle undefined paths', () => {
      const mockPath = undefined as unknown as string;
      const mockFingerprintedPath = '';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should handle null paths', () => {
      const mockPath = null as unknown as string;
      const mockFingerprintedPath = '';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should handle paths with special characters', () => {
      const mockPath = '/images/logo with spaces.png';
      const mockFingerprintedPath = '/images/logo%20with%20spaces.a1b2c3d4.png';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });

    it('should handle paths with query parameters', () => {
      const mockPath = '/js/app.js?v=1.0.0';
      const mockFingerprintedPath = '/js/app.a1b2c3d4.js';
      
      jest.spyOn(fingerprintService, 'getAssetPath').mockReturnValue(mockFingerprintedPath);
      
      const result = assetPathFn(mockPath);
      
      expect(fingerprintService.getAssetPath).toHaveBeenCalledWith(mockPath);
      expect(result).toBe(mockFingerprintedPath);
    });
  });
}); 