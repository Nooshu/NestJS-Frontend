import { CacheConfig, CacheStore, CacheKey } from './cache.types';
import Redis from 'ioredis';

export class MemoryCacheStore implements CacheStore {
  private store: Map<string, { value: string; expires: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires < Date.now()) {
      await this.del(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl * 1000 : Infinity;
    this.store.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export class RedisCacheStore implements CacheStore {
  private client: Redis;

  constructor(config: CacheConfig['redis']) {
    this.client = new Redis({
      host: config?.host || 'localhost',
      port: config?.port || 6379,
      password: config?.password,
      db: config?.db || 0
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}

export class CacheService {
  private store: CacheStore;
  private prefix: string;

  constructor(config: CacheConfig) {
    this.prefix = config.prefix || 'gov-security:';
    this.store = config.store === 'redis' && config.redis
      ? new RedisCacheStore(config.redis)
      : new MemoryCacheStore();
  }

  private buildKey(key: CacheKey): string {
    const parts = [this.prefix, key.type, key.identifier];
    if (key.timestamp) {
      parts.push(key.timestamp.toString());
    }
    return parts.join(':');
  }

  async get<T>(key: CacheKey): Promise<T | null> {
    if (!key) return null;
    
    const cacheKey = this.buildKey(key);
    const value = await this.store.get(cacheKey);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    if (!key || !value) return;
    
    const cacheKey = this.buildKey(key);
    const serialized = JSON.stringify(value);
    
    await this.store.set(cacheKey, serialized, ttl);
  }

  async del(key: CacheKey): Promise<void> {
    if (!key) return;
    
    const cacheKey = this.buildKey(key);
    await this.store.del(cacheKey);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
} 