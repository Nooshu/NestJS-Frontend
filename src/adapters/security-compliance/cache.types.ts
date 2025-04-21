/**
 * Configuration options for the cache service.
 * Defines how the cache should behave and where it should store data.
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Time-to-live for cache entries in seconds */
  ttl: number;
  /** Prefix for cache keys to avoid collisions */
  prefix?: string;
  /** The type of cache store to use */
  store?: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

/**
 * Interface defining the operations available for cache stores.
 * Implemented by different cache storage backends.
 */
export interface CacheStore {
  /**
   * Retrieves a value from the cache.
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  get(key: string): Promise<string | null>;
  
  /**
   * Stores a value in the cache.
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time-to-live in seconds
   */
  set(key: string, value: string, ttl?: number): Promise<void>;
  
  /**
   * Deletes a value from the cache.
   * @param key - The cache key to delete
   */
  del(key: string): Promise<void>;
  
  /**
   * Clears all entries from the cache.
   */
  clear(): Promise<void>;
}

/**
 * Structure for cache keys used throughout the application.
 * Ensures consistent key formatting and type safety.
 */
export interface CacheKey {
  /** The type of data being cached */
  type: 'rate-limit' | 'password-policy' | 'security-headers' | 'audit-log';
  /** Unique identifier for the cached item */
  identifier: string;
  /** Optional timestamp for time-based caching */
  timestamp?: number;
} 