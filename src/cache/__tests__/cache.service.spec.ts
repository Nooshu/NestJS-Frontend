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
}); 