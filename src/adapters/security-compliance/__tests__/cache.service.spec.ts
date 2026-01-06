import { CacheService } from '../cache.service';
import type { CacheConfig, CacheKey } from '../cache.types';

// Mock ioredis for RedisCacheStore
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  flushdb: jest.fn(),
  on: jest.fn(),
  quit: jest.fn(),
};
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

const defaultKey: CacheKey = {
  type: 'rate-limit',
  identifier: 'user-123',
};

const keyWithTimestamp: CacheKey = {
  ...defaultKey,
  timestamp: 1234567890,
};

describe('CacheService (memory store)', () => {
  let service: CacheService;
  let config: CacheConfig;

  beforeEach(() => {
    config = { enabled: true, ttl: 100, prefix: 'test', store: 'memory' };
    service = new CacheService(config);
  });

  it('should build cache keys correctly', () => {
    expect(service['buildKey'](defaultKey)).toBe('test:rate-limit:user-123');
    expect(service['buildKey'](keyWithTimestamp)).toBe('test:rate-limit:user-123:1234567890');
  });

  it('should set and get a value', async () => {
    await service.set(defaultKey, { foo: 'bar' }, 10);
    const result = await service.get<{ foo: string }>(defaultKey);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should return null for missing key', async () => {
    const result = await service.get<{ foo: string }>({ ...defaultKey, identifier: 'missing' });
    expect(result).toBeNull();
  });

  it('should delete a value', async () => {
    await service.set(defaultKey, { foo: 'bar' });
    await service.delete(defaultKey);
    const result = await service.get(defaultKey);
    expect(result).toBeNull();
  });

  it('should clear all values', async () => {
    await service.set(defaultKey, { foo: 'bar' });
    await service.set({ ...defaultKey, identifier: 'other' }, { baz: 1 });
    await service.clear();
    expect(await service.get(defaultKey)).toBeNull();
    expect(await service.get({ ...defaultKey, identifier: 'other' })).toBeNull();
  });

  it('should handle errors in get/set/delete/clear gracefully', async () => {
    // Force store to throw
    const store = service['store'];
    store.get = jest.fn().mockRejectedValue(new Error('fail'));
    store.set = jest.fn().mockRejectedValue(new Error('fail'));
    store.del = jest.fn().mockRejectedValue(new Error('fail'));
    store.clear = jest.fn().mockRejectedValue(new Error('fail'));
    // Should not throw, just log and return null/undefined
    await expect(service.get(defaultKey)).resolves.toBeNull();
    await expect(service.set(defaultKey, { foo: 'bar' })).resolves.toBeUndefined();
    await expect(service.delete(defaultKey)).resolves.toBeUndefined();
    await expect(service.clear()).resolves.toBeUndefined();
  });
});

describe('CacheService (redis store)', () => {
  let service: CacheService;
  let config: CacheConfig;
  let redisClient: any;

  beforeEach(() => {
    // Reset all mock calls
    Object.values(mockRedis).forEach((fn) => fn && fn.mockClear && fn.mockClear());
    config = {
      enabled: true,
      ttl: 100,
      prefix: 'redis',
      store: 'redis',
      redis: { host: 'localhost', port: 6379 },
    };
    service = new CacheService(config);
    const store = (service as any).store;
    store.client = mockRedis;
    redisClient = store.client;
  });

  it('should call Redis get/set/setex/del/flushdb', async () => {
    redisClient.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    redisClient.setex.mockResolvedValue('OK');
    redisClient.set.mockResolvedValue('OK');
    redisClient.del.mockResolvedValue(1);
    redisClient.flushdb.mockResolvedValue('OK');

    await service.set(defaultKey, { foo: 'bar' }, 10);
    expect(redisClient.setex).toHaveBeenCalled();
    await service.set(defaultKey, { foo: 'bar' });
    expect(redisClient.set).toHaveBeenCalled();
    const result = await service.get<{ foo: string }>(defaultKey);
    expect(result).toEqual({ foo: 'bar' });
    await service.delete(defaultKey);
    expect(redisClient.del).toHaveBeenCalled();
    await service.clear();
    expect(redisClient.flushdb).toHaveBeenCalled();
  });

  it('should handle errors in redis store gracefully', async () => {
    redisClient.get.mockRejectedValue(new Error('fail'));
    redisClient.set.mockRejectedValue(new Error('fail'));
    redisClient.setex.mockRejectedValue(new Error('fail'));
    redisClient.del.mockRejectedValue(new Error('fail'));
    redisClient.flushdb.mockRejectedValue(new Error('fail'));
    await expect(service.get(defaultKey)).resolves.toBeNull();
    await expect(service.set(defaultKey, { foo: 'bar' }, 10)).resolves.toBeUndefined();
    await expect(service.delete(defaultKey)).resolves.toBeUndefined();
    await expect(service.clear()).resolves.toBeUndefined();
  });

  it('should return null for missing key in redis', async () => {
    redisClient.get.mockResolvedValue(null);
    const result = await service.get<{ foo: string }>(defaultKey);
    expect(result).toBeNull();
  });

  it('should handle invalid JSON in redis', async () => {
    redisClient.get.mockResolvedValue('not-json');
    const result = await service.get<{ foo: string }>(defaultKey);
    expect(result).toBeNull();
  });
});
