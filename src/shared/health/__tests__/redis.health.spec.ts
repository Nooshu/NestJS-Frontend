import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from '../indicators/redis.health';

describe('RedisHealthIndicator', () => {
  const mockRedisInstance: any = {
    status: 'ready',
    on: jest.fn(),
    ping: jest.fn(),
    info: jest.fn(),
    quit: jest.fn(),
  };

  const createIndicator = (
    redisConfig: unknown,
    options: { attachMockClient?: boolean } = {}
  ) => {
    const indicator = new RedisHealthIndicator().init({
      get: jest.fn().mockReturnValue(redisConfig),
    } as any);

    const existing = (indicator as any).redisClient;
    if (existing && existing !== mockRedisInstance && typeof existing.disconnect === 'function') {
      existing.disconnect();
    }

    if (options.attachMockClient) {
      (indicator as any).isRedisEnabled = true;
      (indicator as any).redisClient = mockRedisInstance;
    }

    return indicator;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisInstance.status = 'ready';
    mockRedisInstance.ping.mockResolvedValue('PONG');
    mockRedisInstance.info.mockResolvedValue('used_memory:100\nmaxmemory:1000\n');
    mockRedisInstance.quit.mockResolvedValue('OK');
    mockRedisInstance.on.mockImplementation(() => mockRedisInstance);
  });

  describe('when Redis is disabled', () => {
    it('should return healthy disabled status for isHealthy', async () => {
      const indicator = createIndicator({ enabled: false });
      const result = await indicator.isHealthy('redis');

      expect(result.redis.status).toBe('up');
      expect(result.redis.message).toBe('Redis is disabled');
      expect(result.redis.enabled).toBe(false);
    });

    it('should skip memory check when disabled', async () => {
      const indicator = createIndicator(undefined);
      const result = await indicator.checkMemoryUsage('redis-memory');

      expect(result['redis-memory'].status).toBe('up');
      expect(result['redis-memory'].message).toContain('disabled');
    });
  });

  describe('when Redis is enabled', () => {
    it('should initialize Redis with defaults and wire event handlers', () => {
      jest.resetModules();

      jest.doMock('ioredis', () => {
        const localMock = {
          status: 'ready',
          on: jest.fn().mockReturnThis(),
          ping: jest.fn(),
          info: jest.fn(),
          quit: jest.fn(),
        };
        const RedisMock = jest.fn(() => localMock);
        (RedisMock as any).__localMock = localMock;
        return { __esModule: true, default: RedisMock };
      });

      const { RedisHealthIndicator: Isolated } = require('../indicators/redis.health');
      const Redis = require('ioredis').default;
      const localMock = Redis.__localMock;

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      new Isolated().init({
        get: () => ({ enabled: true }),
      });

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 6379,
          password: '',
          db: 0,
          lazyConnect: true,
        })
      );

      const handlers: Record<string, Function> = {};
      localMock.on.mock.calls.forEach(([event, handler]: [string, Function]) => {
        handlers[event] = handler;
      });

      handlers.error?.(new Error('conn err'));
      handlers.connect?.();
      handlers.ready?.();
      handlers.close?.();

      expect(consoleWarn).toHaveBeenCalled();
      expect(consoleLog).toHaveBeenCalledTimes(3);

      Redis.mockImplementationOnce(() => {
        throw new Error('init failed');
      });
      const failed = new Isolated().init({
        get: () => ({
          enabled: true,
          host: 'h',
          port: 1,
          password: 'p',
          db: 2,
        }),
      });
      expect((failed as any).redisClient).toBeNull();
      expect(consoleError).toHaveBeenCalled();

      consoleWarn.mockRestore();
      consoleLog.mockRestore();
      consoleError.mockRestore();
      jest.resetModules();
    });

    it('should fail when client was not initialized', async () => {
      const indicator = createIndicator({ enabled: false });
      (indicator as any).isRedisEnabled = true;
      (indicator as any).redisClient = null;

      await expect(indicator.isHealthy('redis')).rejects.toThrow(HealthCheckError);
      await expect(indicator.checkMemoryUsage('redis-memory')).rejects.toThrow(HealthCheckError);
    });

    it('should return healthy when ping succeeds quickly', async () => {
      const indicator = createIndicator(
        { enabled: true, host: 'redis.local', port: 6380, password: 'secret', db: 1 },
        { attachMockClient: true }
      );

      const result = await indicator.isHealthy('redis');
      expect(result.redis.status).toBe('up');
      expect(result.redis.message).toBe('Redis is responsive');
    });

    it('should fail when Redis is not ready', async () => {
      mockRedisInstance.status = 'connecting';
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });

      await expect(indicator.isHealthy('redis')).rejects.toThrow(HealthCheckError);
    });

    it('should fail when ping does not return PONG', async () => {
      mockRedisInstance.ping.mockResolvedValue('NOPE');
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });

      await expect(indicator.isHealthy('redis')).rejects.toThrow(HealthCheckError);
    });

    it('should fail when response time is too high', async () => {
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(600);

      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });
      await expect(indicator.isHealthy('redis')).rejects.toThrow(HealthCheckError);

      nowSpy.mockRestore();
    });

    it('should handle non-Error throws during health check', async () => {
      mockRedisInstance.ping.mockRejectedValue('broken');
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });

      await expect(indicator.isHealthy('redis')).rejects.toThrow(HealthCheckError);
    });

    it('should return healthy memory usage', async () => {
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });
      const result = await indicator.checkMemoryUsage('redis-memory');

      expect(result['redis-memory'].status).toBe('up');
      expect(result['redis-memory'].memoryUsagePercent).toBe(10);
    });

    it('should treat missing memory values as zero usage', async () => {
      mockRedisInstance.info.mockResolvedValue('other:1\n');
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });
      const result = await indicator.checkMemoryUsage('redis-memory');

      expect(result['redis-memory'].status).toBe('up');
      expect(result['redis-memory'].usedMemory).toBe(0);
      expect(result['redis-memory'].maxMemory).toBe(0);
    });

    it('should fail when memory usage is too high', async () => {
      mockRedisInstance.info.mockResolvedValue('used_memory:900\nmaxmemory:1000\n');
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });

      await expect(indicator.checkMemoryUsage('redis-memory')).rejects.toThrow(HealthCheckError);
    });

    it('should handle non-Error throws during memory check', async () => {
      mockRedisInstance.info.mockRejectedValue('memory-broken');
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });

      await expect(indicator.checkMemoryUsage('redis-memory')).rejects.toThrow(HealthCheckError);
    });

    it('should quit redis client on module destroy', async () => {
      const indicator = createIndicator({ enabled: true }, { attachMockClient: true });
      await indicator.onModuleDestroy();
      expect(mockRedisInstance.quit).toHaveBeenCalled();
    });

    it('should no-op onModuleDestroy when client is null', async () => {
      const indicator = createIndicator({ enabled: false });
      (indicator as any).redisClient = null;
      await expect(indicator.onModuleDestroy()).resolves.toBeUndefined();
    });
  });
});
