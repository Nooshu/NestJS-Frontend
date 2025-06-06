import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../cache.service';
import type { Cache } from 'cache-manager';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    // Create a mock cache manager
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('get', () => {
    it('should retrieve a value from cache', async () => {
      // Arrange
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get(testKey);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(testValue);
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

    it('should handle errors gracefully', async () => {
      // Arrange
      const testKey = 'error-key';
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.get(testKey)).rejects.toThrow('Cache error');
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
      const ttl = 3600;

      // Act
      await service.set(testKey, testValue, ttl);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const testKey = 'error-key';
      const testValue = { data: 'test-data' };
      cacheManager.set.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.set(testKey, testValue)).rejects.toThrow('Cache error');
    });

    it('should handle null and undefined values', async () => {
      // Arrange
      const testKey = 'null-key';
      const nullValue = null;
      const undefinedValue = undefined;

      // Act & Assert
      await expect(service.set(testKey, nullValue)).resolves.not.toThrow();
      await expect(service.set(testKey, undefinedValue)).resolves.not.toThrow();
      expect(cacheManager.set).toHaveBeenCalledTimes(2);
    });

    it('should handle different data types', async () => {
      // Arrange
      const testCases = [
        { key: 'string-key', value: 'test string' },
        { key: 'number-key', value: 42 },
        { key: 'boolean-key', value: true },
        { key: 'array-key', value: [1, 2, 3] },
        { key: 'object-key', value: { nested: { value: 'test' } } },
        { key: 'date-key', value: new Date() },
      ];

      // Act & Assert
      for (const testCase of testCases) {
        await service.set(testCase.key, testCase.value);
        expect(cacheManager.set).toHaveBeenCalledWith(testCase.key, testCase.value, undefined);
      }
    });

    it('should handle edge case TTL values', async () => {
      // Arrange
      const testKey = 'ttl-test-key';
      const testValue: string = 'test-value';
      const edgeCases = [0, -1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

      // Act & Assert
      for (const ttl of edgeCases) {
        // Set the value
        await service.set(testKey, testValue, ttl);
        // Verify set was called with correct parameters
        expect(cacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
        
        // Mock the get to return our test value
        cacheManager.get.mockResolvedValue(testValue);
        // Verify we can retrieve the value
        const retrievedValue = await service.get<string>(testKey);
        expect(retrievedValue).toBe(testValue);
        
        // Reset mocks for next iteration
        cacheManager.set.mockClear();
        cacheManager.get.mockClear();
      }
    });
  });

  describe('del', () => {
    it('should delete a value from cache', async () => {
      // Arrange
      const testKey = 'test-key';

      // Act
      await service.del(testKey);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith(testKey);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const testKey = 'error-key';
      cacheManager.del.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.del(testKey)).rejects.toThrow('Cache error');
    });
  });

  describe('clear', () => {
    it('should clear all values from cache', async () => {
      // Act
      await service.clear();

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith('*');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      cacheManager.del.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.clear()).rejects.toThrow('Cache error');
    });

    it('should handle multiple clear operations', async () => {
      // Arrange
      const clearOperations = Array(3).fill(null).map(() => service.clear());

      // Act
      await Promise.all(clearOperations);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledTimes(3);
      expect(cacheManager.del).toHaveBeenCalledWith('*');
    });
  });

  describe('type safety', () => {
    it('should maintain type information when getting cached values', async () => {
      // Arrange
      interface TestType {
        id: number;
        name: string;
      }
      const testValue: TestType = { id: 1, name: 'test' };
      cacheManager.get.mockResolvedValue(testValue);

      // Act
      const result = await service.get<TestType>('test-key');

      // Assert
      expect(result).toEqual(testValue);
      if (result) {
        // TypeScript should know these properties exist
        expect(result.id).toBe(1);
        expect(result.name).toBe('test');
      }
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent get and set operations', async () => {
      // Arrange
      const testKey = 'concurrent-key';
      const operations = Array(10).fill(null).map((_, index) => ({
        key: `${testKey}-${index}`,
        value: `value-${index}`,
      }));

      // Act
      const setPromises = operations.map(op => service.set(op.key, op.value));
      const getPromises = operations.map(op => service.get(op.key));
      
      await Promise.all(setPromises);
      const results = await Promise.all(getPromises);

      // Assert
      expect(results).toHaveLength(operations.length);
      operations.forEach((op) => {
        expect(cacheManager.set).toHaveBeenCalledWith(op.key, op.value, undefined);
        expect(cacheManager.get).toHaveBeenCalledWith(op.key);
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid key types', async () => {
      // Arrange
      const invalidKeys = [null, undefined, 123, {}, [], Symbol('test')];

      // Act & Assert
      for (const invalidKey of invalidKeys) {
        await expect(service.get(invalidKey as any)).rejects.toThrow();
        await expect(service.set(invalidKey as any, 'value')).rejects.toThrow();
        await expect(service.del(invalidKey as any)).rejects.toThrow();
      }
    });

    it('should handle cache manager initialization failure', async () => {
      // Arrange
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          {
            provide: CACHE_MANAGER,
            useValue: null,
          },
        ],
      }).compile();

      const uninitializedService = module.get<CacheService>(CacheService);

      // Act & Assert
      await expect(uninitializedService.get('test')).rejects.toThrow();
      await expect(uninitializedService.set('test', 'value')).rejects.toThrow();
      await expect(uninitializedService.del('test')).rejects.toThrow();
      await expect(uninitializedService.clear()).rejects.toThrow();
    });
  });
}); 