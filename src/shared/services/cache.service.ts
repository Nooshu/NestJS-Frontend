import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

/**
 * Service for managing application caching.
 * Provides methods for storing and retrieving data from the cache with optional TTL (Time To Live).
 *
 * @class CacheService
 * @description Service for managing application-level caching
 *
 * @example
 * // Inject and use the cache service
 * constructor(private readonly cacheService: CacheService) {}
 *
 * // Store data in cache
 * await this.cacheService.set('key', value, 3600); // TTL of 1 hour
 *
 * // Retrieve data from cache
 * const data = await this.cacheService.get('key');
 */
@Injectable()
export class CacheService {
  constructor(@Inject('Cache') private cacheManager: Cache) {}

  /**
   * Retrieves a value from the cache by its key
   *
   * @template T - The type of the cached value
   * @param {string} key - The cache key to retrieve
   * @returns {Promise<T | null>} The cached value or null if not found
   *
   * @example
   * const user = await cacheService.get<User>('user:123');
   */
  async get<T>(key: string): Promise<T | null> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  /**
   * Stores a value in the cache with an optional TTL
   *
   * @param {string} key - The cache key to store the value under
   * @param {any} value - The value to store in the cache
   * @param {number} [ttl] - Optional Time To Live in seconds
   * @returns {Promise<void>}
   *
   * @example
   * // Store with TTL of 1 hour
   * await cacheService.set('user:123', userData, 3600);
   *
   * // Store without TTL (persists until manually removed)
   * await cacheService.set('config', configData);
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}
