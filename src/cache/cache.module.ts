/**
 * Cache module for the NestJS application.
 * This module provides Redis-based caching functionality using @nestjs/cache-manager.
 * It configures the Redis connection and provides a CacheService for use throughout the application.
 *
 * @module AppCacheModule
 * @requires @nestjs/common
 * @requires @nestjs/cache-manager
 * @requires @nestjs/config
 */

import { CacheModule, type CacheOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

/**
 * Module that provides caching functionality using Redis.
 * Configures the Redis connection using environment variables:
 * - REDIS_HOST: Redis server host (default: localhost)
 * - REDIS_PORT: Redis server port (default: 6379)
 * - CACHE_TTL: Default time-to-live for cached items in seconds (default: 3600)
 *
 * @class AppCacheModule
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<CacheOptions> => ({
        store: 'redis',
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('CACHE_TTL', 3600) ?? 3600, // Default TTL: 1 hour
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppCacheModule {}
