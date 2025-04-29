import Redis from 'ioredis';
import type { CacheConfig, CacheKey, CacheStore } from './cache.types';

/**
 * In-memory cache store implementation.
 * Uses a Map to store key-value pairs with expiration logic.
 */
class MemoryCacheStore implements CacheStore {
  private store: Map<string, { value: string; expiresAt: number }>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Retrieves a value from the in-memory cache.
   * @param key - The cache key
   * @returns The cached value or null if not found/expired
   */
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      await this.del(key);
      return null;
    }

    return item.value;
  }

  /**
   * Stores a value in the in-memory cache.
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time-to-live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || 3600) * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Deletes a value from the in-memory cache.
   * @param key - The cache key to delete
   */
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Clears all entries from the in-memory cache.
   */
  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Redis cache store implementation.
 * Uses ioredis to interact with a Redis database.
 */
class RedisCacheStore implements CacheStore {
  private client: Redis;

  constructor(config: CacheConfig) {
    this.client = new Redis({
      host: config.redis?.host || 'localhost',
      port: config.redis?.port || 6379,
      password: config.redis?.password || '',
      db: config.redis?.db || 0,
    });
  }

  /**
   * Retrieves a value from Redis cache.
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Stores a value in Redis cache.
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time-to-live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Deletes a value from Redis cache.
   * @param key - The cache key to delete
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Clears all entries from Redis cache.
   */
  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}

/**
 * Cache service that provides a unified interface for caching operations.
 * Supports both in-memory and Redis-based caching.
 */
export class CacheService {
  private store: CacheStore;
  private prefix: string;

  /**
   * Creates a new CacheService instance.
   * @param config - Cache configuration options
   */
  constructor(config: CacheConfig) {
    this.prefix = config.prefix || 'gov-security';
    this.store = config.store === 'redis' ? new RedisCacheStore(config) : new MemoryCacheStore();
  }

  /**
   * Builds a cache key from the provided components.
   * @param key - The cache key components
   * @returns A formatted cache key string
   */
  private buildKey(key: CacheKey): string {
    const parts = [this.prefix, key.type, key.identifier];
    if (key.timestamp) {
      parts.push(key.timestamp.toString());
    }
    return parts.join(':');
  }

  /**
   * Retrieves a value from the cache.
   * @param key - The cache key components
   * @returns The cached value or null if not found
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    if (!this.store) return null;

    try {
      const value = await this.store.get(this.buildKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Stores a value in the cache.
   * @param key - The cache key components
   * @param value - The value to cache
   * @param ttl - Time-to-live in seconds
   */
  async set(key: CacheKey, value: unknown, ttl?: number): Promise<void> {
    if (!this.store) return;

    try {
      await this.store.set(this.buildKey(key), JSON.stringify(value), ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Deletes a value from the cache.
   * @param key - The cache key components
   */
  async delete(key: CacheKey): Promise<void> {
    if (!this.store) return;

    try {
      await this.store.del(this.buildKey(key));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clears all entries from the cache.
   */
  async clear(): Promise<void> {
    if (!this.store) return;

    try {
      await this.store.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}
