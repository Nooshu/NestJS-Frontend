/**
 * Health check controller for monitoring application status.
 * Provides endpoints to check the application's health and detailed status.
 * 
 * @module HealthController
 * @requires @nestjs/common
 */

import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HttpHealthIndicator,
  HealthIndicatorResult
} from '@nestjs/terminus';
import configuration from '../config/configuration';

/**
 * Health check response interface.
 * 
 * @interface HealthCheckResponse
 */
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
}

/**
 * Controller for health check endpoints using @nestjs/terminus.
 * Provides basic and detailed health monitoring for the application.
 * 
 * @class HealthController
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
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
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),   // 150MB
      
      // Check disk storage
      () => this.disk.checkStorage('disk_health', {
        thresholdPercent: 0.9, // 90%
        path: '/'
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
  detailed() {
    const config = configuration();
    return this.health.check([
      // Include all basic health checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('disk_health', {
        thresholdPercent: 0.9,
        path: '/'
      }),

      // Add custom health check info
      async () => ({
        app_info: {
          status: 'up',
          version: config.npmPackageVersion,
          environment: config.environment,
          node: process.version,
          platform: process.platform,
          memory: {
            status: 'up',
            ...process.memoryUsage()
          }
        }
      })
    ]);
  }
} 