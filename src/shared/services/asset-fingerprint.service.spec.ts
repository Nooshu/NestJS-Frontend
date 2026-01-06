import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AssetFingerprintService } from './asset-fingerprint.service';
import { generateFingerprintMap } from '../utils/file-fingerprint.util';

// Mock the file-fingerprint utility
jest.mock('../utils/file-fingerprint.util', () => ({
  generateFingerprintMap: jest.fn(),
}));

describe('AssetFingerprintService', () => {
  let service: AssetFingerprintService;
  let configService: ConfigService;
  let mockGenerateFingerprintMap: jest.MockedFunction<typeof generateFingerprintMap>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetFingerprintService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssetFingerprintService>(AssetFingerprintService);
    configService = module.get<ConfigService>(ConfigService);
    mockGenerateFingerprintMap = generateFingerprintMap as jest.MockedFunction<
      typeof generateFingerprintMap
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default static directory when config is not provided', () => {
      (configService.get as jest.Mock).mockReturnValue(undefined);

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize with default static directory when config returns null', () => {
      (configService.get as jest.Mock).mockReturnValue(null);

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize with default static directory when config returns empty string', () => {
      (configService.get as jest.Mock).mockReturnValue('');

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize with default static directory when config returns false', () => {
      (configService.get as jest.Mock).mockReturnValue(false);

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize with default static directory when config returns 0', () => {
      (configService.get as jest.Mock).mockReturnValue(0);

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize with configured static directory', () => {
      (configService.get as jest.Mock).mockReturnValue('custom-static');

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('custom-static');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('custom-static', ['*.css', '*.js']);
    });

    it('should initialize with configured static directory when config returns truthy non-string', () => {
      (configService.get as jest.Mock).mockReturnValue(123); // truthy number

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe(123);
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith(123, ['*.css', '*.js']);
    });

    it('should initialize with configured static directory when config returns "public"', () => {
      (configService.get as jest.Mock).mockReturnValue('public'); // truthy string that equals fallback

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).staticDir).toBe('public');
      expect((newService as any).filePatterns).toEqual(['*.css', '*.js']);
      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
    });

    it('should initialize fingerprint map on construction', () => {
      const mockMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      mockGenerateFingerprintMap.mockReturnValue(mockMap);

      const newService = new AssetFingerprintService(configService);

      expect((newService as any).fingerprintMap).toBe(mockMap);
    });
  });

  describe('getHashedPath', () => {
    beforeEach(() => {
      const mockMap = new Map([
        ['/css/app.css', '/css/app.12345678.css'],
        ['/js/main.js', '/js/main.87654321.js'],
      ]);
      mockGenerateFingerprintMap.mockReturnValue(mockMap);
      (service as any).fingerprintMap = mockMap;
    });

    it('should return hashed path when asset exists in map', () => {
      const result = service.getHashedPath('/css/app.css');

      expect(result).toBe('/css/app.12345678.css');
    });

    it('should return original path when asset does not exist in map', () => {
      const result = service.getHashedPath('/css/unknown.css');

      expect(result).toBe('/css/unknown.css');
    });

    it('should return original path when fingerprintMap.get returns undefined', () => {
      // Explicitly test the case where Map.get returns undefined
      const mockMap = new Map();
      mockMap.set('/css/app.css', undefined); // Explicitly set undefined value
      (service as any).fingerprintMap = mockMap;

      const result = service.getHashedPath('/css/app.css');

      expect(result).toBe('/css/app.css');
    });

    it('should return original path when fingerprintMap.get returns empty string', () => {
      // Test the case where Map.get returns empty string (falsy)
      const mockMap = new Map();
      mockMap.set('/css/app.css', ''); // Empty string is falsy
      (service as any).fingerprintMap = mockMap;

      const result = service.getHashedPath('/css/app.css');

      expect(result).toBe('/css/app.css');
    });

    it('should return original path when fingerprintMap.get returns null', () => {
      // Test the case where Map.get returns null (falsy)
      const mockMap = new Map();
      mockMap.set('/css/app.css', null); // null is falsy
      (service as any).fingerprintMap = mockMap;

      const result = service.getHashedPath('/css/app.css');

      expect(result).toBe('/css/app.css');
    });

    it('should return original path for empty string', () => {
      const result = service.getHashedPath('');

      expect(result).toBe('');
    });

    it('should handle paths with different formats', () => {
      const result1 = service.getHashedPath('css/app.css');
      const result2 = service.getHashedPath('./css/app.css');
      const result3 = service.getHashedPath('../css/app.css');

      expect(result1).toBe('css/app.css'); // Not found in map
      expect(result2).toBe('./css/app.css'); // Not found in map
      expect(result3).toBe('../css/app.css'); // Not found in map
    });

    it('should handle JavaScript files', () => {
      const result = service.getHashedPath('/js/main.js');

      expect(result).toBe('/js/main.87654321.js');
    });
  });

  describe('regenerateFingerprintMap', () => {
    it('should regenerate the fingerprint map', () => {
      const initialMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      const newMap = new Map([
        ['/css/app.css', '/css/app.12345678.css'],
        ['/css/new.css', '/css/new.abcdef12.css'],
      ]);

      (service as any).fingerprintMap = initialMap;
      mockGenerateFingerprintMap.mockReturnValue(newMap);

      service.regenerateFingerprintMap();

      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('public', ['*.css', '*.js']);
      expect((service as any).fingerprintMap).toBe(newMap);
    });

    it('should use configured static directory when regenerating', () => {
      (configService.get as jest.Mock).mockReturnValue('custom-static');
      const newService = new AssetFingerprintService(configService);

      const newMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      mockGenerateFingerprintMap.mockReturnValue(newMap);

      newService.regenerateFingerprintMap();

      expect(mockGenerateFingerprintMap).toHaveBeenCalledWith('custom-static', ['*.css', '*.js']);
    });

    it('should handle empty map regeneration', () => {
      const emptyMap = new Map();
      mockGenerateFingerprintMap.mockReturnValue(emptyMap);

      service.regenerateFingerprintMap();

      expect((service as any).fingerprintMap).toBe(emptyMap);
      expect((service as any).fingerprintMap.size).toBe(0);
    });
  });

  describe('private initializeFingerprintMap', () => {
    it('should be called during construction', () => {
      const mockMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      mockGenerateFingerprintMap.mockClear();
      mockGenerateFingerprintMap.mockReturnValue(mockMap);

      const newService = new AssetFingerprintService(configService);

      expect(mockGenerateFingerprintMap).toHaveBeenCalledTimes(1);
      expect((newService as any).fingerprintMap).toBe(mockMap);
    });

    it('should be called when regenerateFingerprintMap is invoked', () => {
      const initialMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      const newMap = new Map([['/css/app.css', '/css/app.12345678.css']]);

      (service as any).fingerprintMap = initialMap;
      mockGenerateFingerprintMap.mockClear();
      mockGenerateFingerprintMap.mockReturnValue(newMap);

      service.regenerateFingerprintMap();

      expect(mockGenerateFingerprintMap).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle errors from generateFingerprintMap during construction', () => {
      const error = new Error('File system error');
      mockGenerateFingerprintMap.mockImplementation(() => {
        throw error;
      });

      expect(() => new AssetFingerprintService(configService)).toThrow('File system error');
    });

    it('should handle errors from generateFingerprintMap during regeneration', () => {
      const error = new Error('File system error');
      mockGenerateFingerprintMap.mockImplementation(() => {
        throw error;
      });

      expect(() => service.regenerateFingerprintMap()).toThrow('File system error');
    });

    it('should handle non-Error exceptions from generateFingerprintMap', () => {
      mockGenerateFingerprintMap.mockImplementation(() => {
        throw 'String error';
      });

      expect(() => new AssetFingerprintService(configService)).toThrow('String error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple consecutive calls to getHashedPath', () => {
      const mockMap = new Map([
        ['/css/app.css', '/css/app.12345678.css'],
        ['/js/main.js', '/js/main.87654321.js'],
      ]);
      (service as any).fingerprintMap = mockMap;

      const results = [
        service.getHashedPath('/css/app.css'),
        service.getHashedPath('/js/main.js'),
        service.getHashedPath('/css/app.css'),
        service.getHashedPath('/css/unknown.css'),
      ];

      expect(results).toEqual([
        '/css/app.12345678.css',
        '/js/main.87654321.js',
        '/css/app.12345678.css',
        '/css/unknown.css',
      ]);
    });

    it('should maintain state consistency after regeneration', () => {
      const initialMap = new Map([['/css/app.css', '/css/app.12345678.css']]);
      const newMap = new Map([
        ['/css/app.css', '/css/app.99999999.css'],
        ['/css/new.css', '/css/new.abcdef12.css'],
      ]);

      (service as any).fingerprintMap = initialMap;
      mockGenerateFingerprintMap.mockReturnValue(newMap);

      // Verify initial state
      expect(service.getHashedPath('/css/app.css')).toBe('/css/app.12345678.css');
      expect(service.getHashedPath('/css/new.css')).toBe('/css/new.css');

      // Regenerate
      service.regenerateFingerprintMap();

      // Verify new state
      expect(service.getHashedPath('/css/app.css')).toBe('/css/app.99999999.css');
      expect(service.getHashedPath('/css/new.css')).toBe('/css/new.abcdef12.css');
    });
  });
});
