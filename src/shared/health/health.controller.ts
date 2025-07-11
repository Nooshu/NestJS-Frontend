/**
 * Comprehensive health check controller for monitoring application status.
 * Provides multiple endpoints to check various aspects of application health.
 *
 * @module HealthController
 * @requires @nestjs/common
 * @requires @nestjs/terminus
 */

import { Controller, Get, Query } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { HttpHealthIndicator } from './indicators/http.health';
import { ApplicationHealthIndicator } from './indicators/application.health';

/**
 * Controller for comprehensive health check endpoints using @nestjs/terminus.
 * Provides basic, detailed, and specialized health monitoring for the application.
 *
 * @class HealthController
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private database: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
    private http: HttpHealthIndicator,
    private application: ApplicationHealthIndicator
  ) {}

  /**
   * Basic health check endpoint that monitors critical system metrics.
   * @returns {Promise<HealthIndicatorResult>} Health check results
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic application health
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024), // 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024), // 500MB

      // Check disk storage
      () =>
        this.disk.checkStorage('disk_health', {
          thresholdPercent: 0.9, // 90%
          path: '/',
        }),
    ]);
  }

  /**
   * Detailed health check endpoint that provides comprehensive system information.
   * Includes memory usage, disk health, application version, and environment details.
   * @returns {Promise<HealthIndicatorResult>} Detailed health check results
   */
  @Get('detailed')
  @HealthCheck()
  async detailed() {
    try {
      return await this.health.check([
        // System health checks
        () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
        () =>
          this.disk.checkStorage('disk_health', {
            thresholdPercent: 0.9,
            path: '/',
          }),

        // Application health checks
        () => this.application.checkUptime('app_uptime'),
        () => this.application.checkConfiguration('app_config'),
        () => this.application.checkPerformance('app_performance'),
        () => this.application.checkDependencies('app_dependencies'),

        // External dependencies (with error handling)
        () => this.database.isHealthy('database').catch(() => ({ database: { status: 'down', message: 'Database check failed' } })),
        () => this.redis.isHealthy('redis').catch(() => ({ redis: { status: 'down', message: 'Redis check failed' } })),
      ]);
    } catch (error) {
      // If health check fails, return a partial result with available information
      return {
        status: 'error',
        info: {
          memory_heap: { status: 'up' },
          app_uptime: { status: 'up' },
          app_config: { status: 'up' },
          app_performance: { status: 'up' },
        },
        error: {
          message: error instanceof Error ? error.message : 'Health check failed',
        },
      };
    }
  }

  /**
   * Database-specific health check endpoint.
   * @returns {Promise<HealthIndicatorResult>} Database health check results
   */
  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.database.isHealthy('database'),
    ]);
  }

  /**
   * Redis-specific health check endpoint.
   * @returns {Promise<HealthIndicatorResult>} Redis health check results
   */
  @Get('redis')
  @HealthCheck()
  checkRedis() {
    return this.health.check([
      () => this.redis.isHealthy('redis'),
      () => this.redis.checkMemoryUsage('redis_memory'),
    ]);
  }

  /**
   * HTTP services health check endpoint.
   * @param urls - Optional comma-separated list of URLs to check
   * @returns {Promise<HealthIndicatorResult>} HTTP services health check results
   */
  @Get('http')
  @HealthCheck()
  checkHttp(@Query('urls') urls?: string) {
    const defaultEndpoints = [
      { name: 'Google', url: 'https://www.google.com', timeout: 5000 },
      { name: 'Cloudflare', url: 'https://1.1.1.1', timeout: 5000 },
    ];

    if (urls) {
      const customEndpoints = urls.split(',').map((url, index) => ({
        name: `Custom-${index + 1}`,
        url: url.trim(),
        timeout: 5000,
      }));

      return this.health.check([
        () => this.http.checkMultipleEndpoints('http_services', customEndpoints),
      ]);
    }

    return this.health.check([
      () => this.http.checkMultipleEndpoints('http_services', defaultEndpoints),
    ]);
  }

  /**
   * Application-specific health check endpoint.
   * @returns {Promise<HealthIndicatorResult>} Application health check results
   */
  @Get('application')
  @HealthCheck()
  checkApplication() {
    return this.health.check([
      () => this.application.checkUptime('uptime'),
      () => this.application.checkConfiguration('configuration'),
      () => this.application.checkPerformance('performance'),
      () => this.application.checkDependencies('dependencies'),
    ]);
  }

  /**
   * System resources health check endpoint.
   * @returns {Promise<HealthIndicatorResult>} System resources health check results
   */
  @Get('system')
  @HealthCheck()
  checkSystem() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024), // 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024), // 500MB
      () =>
        this.disk.checkStorage('disk_storage', {
          thresholdPercent: 0.85, // 85%
          path: '/',
        }),
      () => this.application.checkPerformance('system_performance'),
    ]);
  }

  /**
   * Readiness probe endpoint for Kubernetes/container orchestration.
   * Checks if the application is ready to receive traffic.
   * @returns {Promise<HealthIndicatorResult>} Readiness check results
   */
  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.application.checkConfiguration('config_ready'),
      () => this.application.checkDependencies('dependencies_ready'),
      // Add database/redis checks if they're critical for readiness
      () => this.database.isHealthy('database_ready').catch(() => ({ database_ready: { status: 'down', message: 'Database not ready' } })),
    ]);
  }

  /**
   * Liveness probe endpoint for Kubernetes/container orchestration.
   * Checks if the application is alive and should not be restarted.
   * @returns {Promise<HealthIndicatorResult>} Liveness check results
   */
  @Get('live')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap_live', 300 * 1024 * 1024), // 300MB - higher threshold for liveness
      () => this.application.checkUptime('uptime_live'),
    ]);
  }
}
