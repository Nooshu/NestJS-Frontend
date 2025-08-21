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

    it('should properly inject FingerprintService through NestJS DI', async () => {
      const mockFingerprintService = {
        getAssetPath: jest.fn(),
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

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AssetPathExtension,
          {
            provide: FingerprintService,
            useValue: mockFingerprintService,
          },
        ],
      }).compile();

      const instance = module.get<AssetPathExtension>(AssetPathExtension);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService']).toBe(mockFingerprintService);
    });

    it('should handle constructor with minimal FingerprintService implementation', () => {
      const minimalService = {
        getAssetPath: jest.fn(),
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

      const instance = new AssetPathExtension(minimalService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
    });

    it('should properly set the private fingerprintService property', () => {
      const mockService = {
        getAssetPath: jest.fn(),
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

      const instance = new AssetPathExtension(mockService);
      
      // Test that the private property is accessible and set correctly
      expect(instance['fingerprintService']).toBe(mockService);
      expect(instance['fingerprintService'].getAssetPath).toBeDefined();
    });

    it('should handle constructor with service that has all required methods', () => {
      const completeService = {
        getAssetPath: jest.fn(),
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

      const instance = new AssetPathExtension(completeService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService']).toBe(completeService);
    });

    it('should work with service that has only the essential getAssetPath method', () => {
      const essentialService = {
        getAssetPath: jest.fn(),
      } as unknown as FingerprintService;

      const instance = new AssetPathExtension(essentialService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService'].getAssetPath).toBeDefined();
    });

    it('should properly handle constructor parameter injection with explicit parameter', () => {
      const mockService = {
        getAssetPath: jest.fn(),
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

      // Test explicit constructor call
      const instance = new AssetPathExtension(mockService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      
      // Verify the injected service is properly stored
      const storedService = (instance as any).fingerprintService;
      expect(storedService).toBe(mockService);
      expect(storedService.getAssetPath).toBeDefined();
    });

    it('should handle constructor with service instantiated through different patterns', () => {
      // Test with service created through object literal
      const literalService = {
        getAssetPath: jest.fn(),
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

      const instance1 = new AssetPathExtension(literalService);
      expect(instance1).toBeInstanceOf(AssetPathExtension);

      // Test with service created through class instantiation
      class MockFingerprintService implements Partial<FingerprintService> {
        getAssetPath = jest.fn();
      }
      
      const classService = new MockFingerprintService() as unknown as FingerprintService;
      const instance2 = new AssetPathExtension(classService);
      expect(instance2).toBeInstanceOf(AssetPathExtension);
    });

    it('should ensure constructor properly assigns the injected service', () => {
      const mockService = {
        getAssetPath: jest.fn(),
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

      const instance = new AssetPathExtension(mockService);
      
      // Test that the service is properly assigned and accessible
      expect(instance['fingerprintService']).toBeDefined();
      expect(instance['fingerprintService']).toBe(mockService);
      
      // Test that the service method is callable
      expect(typeof instance['fingerprintService'].getAssetPath).toBe('function');
    });

    it('should handle constructor with service passed as a variable', () => {
      // Create service as a variable first
      const serviceVariable = {
        getAssetPath: jest.fn(),
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

      // Pass the variable to constructor
      const instance = new AssetPathExtension(serviceVariable);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService']).toBe(serviceVariable);
    });

    it('should handle constructor with service created through factory function', () => {
      // Create service through a factory function
      const createMockService = () => ({
        getAssetPath: jest.fn(),
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
      } as unknown as FingerprintService);

      const factoryService = createMockService();
      const instance = new AssetPathExtension(factoryService);
      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService']).toBe(factoryService);
    });

    it('should handle constructor with service passed as a direct object literal', () => {
      // Pass object literal directly to constructor
      const instance = new AssetPathExtension({
        getAssetPath: jest.fn(),
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
      } as unknown as FingerprintService);

      expect(instance).toBeInstanceOf(AssetPathExtension);
      expect(instance['fingerprintService'].getAssetPath).toBeDefined();
    });

    it('should handle constructor with service that has different property access patterns', () => {
      const mockService = {
        getAssetPath: jest.fn(),
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

      // Test different ways of accessing the service
      const instance = new AssetPathExtension(mockService);
      
      // Access through bracket notation
      const service1 = instance['fingerprintService'];
      expect(service1).toBe(mockService);
      
      // Access through any type assertion
      const service2 = (instance as any).fingerprintService;
      expect(service2).toBe(mockService);
      
      // Verify the service is properly stored
      expect(service1.getAssetPath).toBeDefined();
      expect(service2.getAssetPath).toBeDefined();
    });

    it('should ensure constructor parameter injection works with all access patterns', () => {
      const mockService = {
        getAssetPath: jest.fn(),
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

      // Test constructor with explicit parameter
      const instance = new AssetPathExtension(mockService);
      
      // Test all possible ways to access the injected service
      expect(instance['fingerprintService']).toBe(mockService);
      expect((instance as any).fingerprintService).toBe(mockService);
      expect(Object.getOwnPropertyDescriptor(instance, 'fingerprintService')?.value).toBe(mockService);
      
      // Test that the service is properly injected and accessible
      expect(instance['fingerprintService'].getAssetPath).toBeDefined();
      expect(typeof instance['fingerprintService'].getAssetPath).toBe('function');
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