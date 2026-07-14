/**
 * Service that provides caching functionality using Redis.
 * This service wraps the cache-manager functionality and provides a simple interface
 * for caching data in the application.
 */

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

/**
 * Service that provides methods for interacting with the Redis cache.
 *
 *
 * @example
 * ```ts
 * // Inject CacheService, then:
 * await this.cacheService.set('key', data, 3600);
 * const cachedData = await this.cacheService.get('key');
 * ```
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Validates that the cache key is a non-empty string.
   * @param key - The key to validate
   * @throws Error - If the key is invalid
   */
  private validateKey(key: any): void {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Cache key must be a non-empty string');
    }
  }

  /**
   * Retrieves a value from the cache.
   *
   * @param key - The key to retrieve from the cache
   * @returns The cached value or null if not found
   * @template T - The type of the cached value
   * @throws Error - If the key is invalid
   */
  async get<T>(key: string): Promise<T | null> {
    this.validateKey(key);
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  /**
   * Stores a value in the cache.
   *
   * @param key - The key to store the value under
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   * @throws Error - If the key is invalid
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.validateKey(key);
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Removes a value from the cache.
   *
   * @param key - The key to remove from the cache
   * @throws Error - If the key is invalid
   */
  async del(key: string): Promise<void> {
    this.validateKey(key);
    await this.cacheManager.del(key);
  }

  /**
   * Clears all values from the cache.
   * Uses Redis pattern matching to efficiently clear all keys.
   */
  async clear(): Promise<void> {
    // Since we're using Redis, we can use the del method with a pattern
    // to clear all keys. This is more efficient than getting all keys first.
    await this.cacheManager.del('*');
  }
}
