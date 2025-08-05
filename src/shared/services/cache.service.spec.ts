import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import type { Cache } from 'cache-manager';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    // Create a mock cache manager
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'Cache',
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get('Cache');

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have cacheManager injected', () => {
      expect(cacheManager).toBeDefined();
    });
  });

  describe('get', () => {
    it('should retrieve a value from cache with correct type', async () => {
      // Arrange
      const testKey = 'test-key';
      const testValue = { data: 'test-data', id: 123 };
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<typeof testValue>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(testValue);
      expect(typeof result).toBe('object');
    });

    it('should return null when key does not exist', async () => {
      // Arrange
      const testKey = 'non-existent-key';
      cacheManager.get.mockResolvedValue(null);

      // Act
      const result = await service.get(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBeNull();
    });

    it('should handle string values', async () => {
      // Arrange
      const testKey = 'string-key';
      const testValue = 'test string value';
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<string>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
      expect(typeof result).toBe('string');
    });

    it('should handle number values', async () => {
      // Arrange
      const testKey = 'number-key';
      const testValue = 42;
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<number>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
      expect(typeof result).toBe('number');
    });

    it('should handle boolean values', async () => {
      // Arrange
      const testKey = 'boolean-key';
      const testValue = true;
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<boolean>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
      expect(typeof result).toBe('boolean');
    });

    it('should handle array values', async () => {
      // Arrange
      const testKey = 'array-key';
      const testValue = [1, 2, 3, 'test'];
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<typeof testValue>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(testValue);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle complex nested objects', async () => {
      // Arrange
      const testKey = 'complex-object-key';
      const testValue = {
        user: {
          id: 1,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        metadata: {
          createdAt: new Date(),
          version: '1.0.0',
        },
      };
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<typeof testValue>(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(testValue);
      expect(result?.user?.name).toBe('John Doe');
    });

    it('should handle undefined values', async () => {
      // Arrange
      const testKey = 'undefined-key';
      cacheManager.get.mockResolvedValue(undefined);

      // Act
      const result = await service.get(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBeNull();
    });

    it('should handle cache manager errors', async () => {
      // Arrange
      const testKey = 'error-key';
      const errorMessage = 'Cache connection failed';
      cacheManager.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.get(testKey)).rejects.toThrow(errorMessage);
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
    });

    it('should handle empty string key', async () => {
      // Arrange
      const testKey = '';
      const testValue = 'empty key value';
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });

    it('should handle special characters in key', async () => {
      // Arrange
      const testKey = 'special-chars:test@key#123';
      const testValue = 'special key value';
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });
  });

  describe('set', () => {
    it('should store a value in cache without TTL', async () => {
      // Arrange
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should store a value in cache with TTL', async () => {
      // Arrange
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };
      const ttl = 3600; // 1 hour

      // Act
      await service.set(testKey, testValue, ttl);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
    });

    it('should handle string values', async () => {
      // Arrange
      const testKey = 'string-key';
      const testValue = 'test string value';

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle number values', async () => {
      // Arrange
      const testKey = 'number-key';
      const testValue = 42;

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle boolean values', async () => {
      // Arrange
      const testKey = 'boolean-key';
      const testValue = true;

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle array values', async () => {
      // Arrange
      const testKey = 'array-key';
      const testValue = [1, 2, 3, 'test'];

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle complex nested objects', async () => {
      // Arrange
      const testKey = 'complex-object-key';
      const testValue = {
        user: {
          id: 1,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        metadata: {
          createdAt: new Date(),
          version: '1.0.0',
        },
      };

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle null values', async () => {
      // Arrange
      const testKey = 'null-key';
      const testValue = null;

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle undefined values', async () => {
      // Arrange
      const testKey = 'undefined-key';
      const testValue = undefined;

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle different TTL values', async () => {
      // Arrange
      const testKey = 'ttl-test-key';
      const testValue = 'test-value';
      const ttlValues = [0, 1, 60, 3600, 86400, 31536000]; // Various TTL values

      // Act & Assert
      for (const ttl of ttlValues) {
        await service.set(testKey, testValue, ttl);
        expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
        cacheManager.set.mockClear();
      }
    });

    it('should handle edge case TTL values', async () => {
      // Arrange
      const testKey = 'edge-ttl-key';
      const testValue = 'test-value';
      const edgeCases = [-1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

      // Act & Assert
      for (const ttl of edgeCases) {
        await service.set(testKey, testValue, ttl);
        expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
        cacheManager.set.mockClear();
      }
    });

    it('should handle cache manager errors', async () => {
      // Arrange
      const testKey = 'error-key';
      const testValue = { data: 'test-data' };
      const errorMessage = 'Cache storage failed';
      cacheManager.set.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.set(testKey, testValue)).rejects.toThrow(errorMessage);
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle empty string key', async () => {
      // Arrange
      const testKey = '';
      const testValue = 'empty key value';

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle special characters in key', async () => {
      // Arrange
      const testKey = 'special-chars:test@key#123';
      const testValue = 'special key value';

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle Date objects', async () => {
      // Arrange
      const testKey = 'date-key';
      const testValue = new Date();

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });

    it('should handle functions (though not recommended)', async () => {
      // Arrange
      const testKey = 'function-key';
      const testValue = () => 'test function';

      // Act
      await service.set(testKey, testValue);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });
  });

  describe('integration scenarios', () => {
    it('should handle get after set workflow', async () => {
      // Arrange
      const testKey = 'workflow-key';
      const testValue = { workflow: 'test', step: 1 };
      
      // Mock set to resolve successfully
      cacheManager.set.mockResolvedValue(undefined);
      // Mock get to return the value we just set
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      await service.set(testKey, testValue);
      const retrievedValue = await service.get<typeof testValue>(testKey);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(retrievedValue).toEqual(testValue);
    });

    it('should handle multiple operations in sequence', async () => {
      // Arrange
      const operations = [
        { key: 'key1', value: 'value1', ttl: 60 },
        { key: 'key2', value: { nested: 'value2' }, ttl: undefined },
        { key: 'key3', value: 123, ttl: 3600 },
      ];

      // Mock set to resolve successfully
      cacheManager.set.mockResolvedValue(undefined);
      // Mock get to return values
      cacheManager.get.mockImplementation((key) => {
        const op = operations.find(o => o.key === key);
        return Promise.resolve(op ? op.value : null);
      });

      // Act & Assert
      for (const operation of operations) {
        await service.set(operation.key, operation.value, operation.ttl);
        expect(cacheManager.set).toHaveBeenCalledWith(operation.key, operation.value, operation.ttl);
        
        const retrievedValue = await service.get(operation.key);
        expect(retrievedValue).toEqual(operation.value);
      }
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const testKey = 'concurrent-key';
      const testValue = 'concurrent-value';
      
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const promises = [
        service.set(testKey, testValue),
        service.set(testKey, testValue),
        service.get(testKey),
        service.get(testKey),
      ];

      await Promise.all(promises);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledTimes(2);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should propagate cache manager get errors', async () => {
      // Arrange
      const testKey = 'error-key';
      const error = new Error('Cache get error');
      cacheManager.get.mockRejectedValue(error);

      // Act & Assert
      await expect(service.get(testKey)).rejects.toThrow('Cache get error');
    });

    it('should propagate cache manager set errors', async () => {
      // Arrange
      const testKey = 'error-key';
      const testValue = 'error-value';
      const error = new Error('Cache set error');
      cacheManager.set.mockRejectedValue(error);

      // Act & Assert
      await expect(service.set(testKey, testValue)).rejects.toThrow('Cache set error');
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const testKey = 'timeout-key';
      const timeoutError = new Error('Cache timeout');
      timeoutError.name = 'TimeoutError';
      cacheManager.get.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(service.get(testKey)).rejects.toThrow('Cache timeout');
    });

    it('should handle connection refused errors', async () => {
      // Arrange
      const testKey = 'connection-key';
      const connectionError = new Error('Connection refused');
      connectionError.name = 'ConnectionError';
      cacheManager.set.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(service.set(testKey, 'value')).rejects.toThrow('Connection refused');
    });
  });
}); 