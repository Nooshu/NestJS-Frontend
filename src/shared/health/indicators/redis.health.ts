import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis health indicator for monitoring Redis connectivity and performance.
 * Provides real Redis health checks when Redis is enabled, or graceful degradation when disabled.
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redisClient: Redis | null = null;
  private isRedisEnabled: boolean = false;

  constructor(private configService: ConfigService) {
    super();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection if enabled in configuration
   */
  private initializeRedis(): void {
    const redisConfig = this.configService.get('redis');
    this.isRedisEnabled = redisConfig?.enabled || false;

    if (this.isRedisEnabled) {
      try {
        this.redisClient = new Redis({
          host: redisConfig.host || 'localhost',
          port: redisConfig.port || 6379,
          password: redisConfig.password || '',
          db: redisConfig.db || 0,
          maxRetriesPerRequest: 3,
          lazyConnect: true, // Don't connect immediately
        });

        // Handle Redis connection events
        this.redisClient.on('error', (error) => {
          console.warn('Redis connection error:', error.message);
        });

        this.redisClient.on('connect', () => {
          console.log('Redis connected successfully');
        });

        this.redisClient.on('ready', () => {
          console.log('Redis is ready to accept commands');
        });

        this.redisClient.on('close', () => {
          console.log('Redis connection closed');
        });
      } catch (error) {
        console.error('Failed to initialize Redis client:', error);
        this.redisClient = null;
      }
    }
  }

  /**
   * Check Redis health including connection status and response time.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // If Redis is not enabled, return healthy status
    if (!this.isRedisEnabled) {
      return this.getStatus(key, true, {
        message: 'Redis is disabled',
        enabled: false,
        details: {
          status: 'disabled',
          reason: 'Redis is not enabled in configuration',
        },
      });
    }

    // If Redis client is not available, return unhealthy status
    if (!this.redisClient) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, {
          message: 'Redis client not initialized',
          enabled: true,
          details: {
            status: 'error',
            reason: 'Redis client initialization failed',
          },
        })
      );
    }

    try {
      const startTime = Date.now();

      // Check if Redis is connected
      if (this.redisClient.status !== 'ready') {
        throw new HealthCheckError(
          'Redis check failed',
          this.getStatus(key, false, {
            message: 'Redis is not connected',
            enabled: true,
            details: {
              status: this.redisClient.status,
              reason: 'Redis connection not ready',
            },
          })
        );
      }

      // Perform a ping test
      const pingResult = await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      if (pingResult !== 'PONG') {
        throw new HealthCheckError(
          'Redis check failed',
          this.getStatus(key, false, {
            responseTime,
            message: 'Redis ping failed',
            enabled: true,
            details: {
              ping: pingResult,
              status: 'error',
            },
          })
        );
      }

      const isHealthy = responseTime < 500; // Consider healthy if response time < 500ms

      if (!isHealthy) {
        throw new HealthCheckError(
          'Redis check failed',
          this.getStatus(key, false, {
            responseTime,
            message: 'Redis response time too high',
            enabled: true,
            details: {
              ping: pingResult,
              status: 'slow',
            },
          })
        );
      }

      return this.getStatus(key, true, {
        responseTime,
        message: 'Redis is responsive',
        enabled: true,
        details: {
          ping: pingResult,
          status: 'ready',
          connectionStatus: this.redisClient.status,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redis connection failed';
      const errorName = error instanceof Error ? error.name : 'RedisError';

      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
          enabled: true,
          details: {
            status: 'error',
            reason: errorMessage,
          },
        })
      );
    }
  }

  /**
   * Check Redis memory usage and performance metrics.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async checkMemoryUsage(key: string): Promise<HealthIndicatorResult> {
    // If Redis is not enabled, return healthy status
    if (!this.isRedisEnabled) {
      return this.getStatus(key, true, {
        message: 'Redis memory check skipped - Redis is disabled',
        enabled: false,
        details: {
          status: 'disabled',
        },
      });
    }

    // If Redis client is not available, return unhealthy status
    if (!this.redisClient) {
      throw new HealthCheckError(
        'Redis memory check failed',
        this.getStatus(key, false, {
          message: 'Redis client not initialized',
          enabled: true,
          details: {
            status: 'error',
          },
        })
      );
    }

    try {
      // Get Redis memory info
      const info = await this.redisClient.info('memory');
      
      // Parse memory info to get used and max memory
      const usedMemoryMatch = info.match(/used_memory:(\d+)/);
      const maxMemoryMatch = info.match(/maxmemory:(\d+)/);
      
      const usedMemory = usedMemoryMatch ? parseInt(usedMemoryMatch[1], 10) : 0;
      const maxMemory = maxMemoryMatch ? parseInt(maxMemoryMatch[1], 10) : 0;
      
      const memoryUsagePercent = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;
      const isHealthy = memoryUsagePercent < 80; // Consider healthy if memory usage < 80%

      if (!isHealthy) {
        throw new HealthCheckError(
          'Redis memory check failed',
          this.getStatus(key, false, {
            memoryUsagePercent: Math.round(memoryUsagePercent),
            usedMemory,
            maxMemory,
            message: 'Redis memory usage too high',
            enabled: true,
            details: {
              status: 'warning',
              usagePercent: Math.round(memoryUsagePercent),
            },
          })
        );
      }

      return this.getStatus(key, true, {
        memoryUsagePercent: Math.round(memoryUsagePercent),
        usedMemory,
        maxMemory,
        message: 'Redis memory usage is healthy',
        enabled: true,
        details: {
          status: 'healthy',
          usagePercent: Math.round(memoryUsagePercent),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redis memory check failed';
      const errorName = error instanceof Error ? error.name : 'RedisMemoryError';

      throw new HealthCheckError(
        'Redis memory check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
          enabled: true,
          details: {
            status: 'error',
          },
        })
      );
    }
  }

  /**
   * Clean up Redis connection when the service is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
