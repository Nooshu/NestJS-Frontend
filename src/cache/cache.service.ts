/**
 * Service that provides caching functionality using Redis.
 * This service wraps the cache-manager functionality and provides a simple interface
 * for caching data in the application.
 * 
 * @module CacheService
 * @requires @nestjs/common
 * @requires @nestjs/cache-manager
 */

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Service that provides methods for interacting with the Redis cache.
 * 
 * @class CacheService
 * @description Provides methods for getting, setting, and deleting cached data
 * 
 * @example
 * // Inject and use the cache service
 * constructor(private readonly cacheService: CacheService) {}
 * 
 * // Cache some data
 * await this.cacheService.set('key', data, 3600);
 * 
 * // Retrieve cached data
 * const cachedData = await this.cacheService.get('key');
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Retrieves a value from the cache.
   * 
   * @param {string} key - The key to retrieve from the cache
   * @returns {Promise<T | null>} The cached value or null if not found
   * @template T - The type of the cached value
   */
  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Stores a value in the cache.
   * 
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to cache
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {Promise<void>}
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Removes a value from the cache.
   * 
   * @param {string} key - The key to remove from the cache
   * @returns {Promise<void>}
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clears all values from the cache.
   * Uses Redis pattern matching to efficiently clear all keys.
   * 
   * @returns {Promise<void>}
   */
  async clear(): Promise<void> {
    // Since we're using Redis, we can use the del method with a pattern
    // to clear all keys. This is more efficient than getting all keys first.
    await this.cacheManager.del('*');
  }
} 