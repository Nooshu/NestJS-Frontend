/**
 * HTTP health endpoints for ops, load balancers, and Kubernetes probes.
 *
 * Mounted at `/health`. Basic `/health` is cheap (memory/disk). Prefer
 * `/health/ready` and `/health/live` for orchestration; `/detailed` and
 * dependency-specific routes are for diagnostics and may hit external systems.
 * CSRF is excluded for this path in AppModule.
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
 * Terminus health controller. Indicators are injected; each handler composes
 * one or more checks and returns Terminus JSON (or a softened error payload
 * from `detailed` when a check throws).
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
   * Lightweight liveness-style check: heap, RSS, and root disk usage.
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
   * Full diagnostic suite (system + app + DB/Redis with soft failures).
   * Side effect: may call external/network indicators; swallows per-indicator
   * failures into "down" status rather than failing the whole probe where caught.
   *
   * @returns Terminus result or partial error-shaped object
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
        () =>
          this.database
            .isHealthy('database')
            .catch(() => ({ database: { status: 'down', message: 'Database check failed' } })),
        () =>
          this.redis
            .isHealthy('redis')
            .catch(() => ({ redis: { status: 'down', message: 'Redis check failed' } })),
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
   * Database connectivity only.
   */
  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.database.isHealthy('database')]);
  }

  /**
   * Redis connectivity and memory usage.
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
   * Outbound HTTP reachability. Optional `urls` query overrides the default
   * public endpoints (comma-separated absolute URLs).
   *
   * @param urls - Comma-separated URL list
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
   * Application process health (uptime, config, performance, dependency stubs).
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
   * Host resource pressure (memory/disk) plus app performance indicator.
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
   * Kubernetes readiness: config/deps and optional DB. Fail ⇒ stop sending traffic.
   */
  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.application.checkConfiguration('config_ready'),
      () => this.application.checkDependencies('dependencies_ready'),
      // Add database/redis checks if they're critical for readiness
      () =>
        this.database
          .isHealthy('database_ready')
          .catch(() => ({ database_ready: { status: 'down', message: 'Database not ready' } })),
    ]);
  }

  /**
   * Kubernetes liveness: process still healthy enough not to restart.
   * Uses a lower heap threshold than readiness-oriented checks.
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
