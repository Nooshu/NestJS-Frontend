/**
 * Health check controller for monitoring application status.
 * Provides endpoints to check the application's health and detailed status.
 * 
 * @module HealthController
 * @requires @nestjs/common
 */

import { Controller, Get } from '@nestjs/common';
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
 * Controller for health check endpoints.
 * 
 * @class HealthController
 * @description Provides endpoints to monitor application health
 */
@Controller('health')
export class HealthController {
  /**
   * Basic health check endpoint.
   * Returns a simple status indicating the application is running.
   * 
   * @method check
   * @returns {HealthCheckResponse} Basic health status
   */
  @Get()
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detailed health check endpoint.
   * Returns comprehensive status information about the application.
   * 
   * @method detailed
   * @returns {HealthCheckResponse} Detailed health status
   */
  @Get('detailed')
  detailed(): HealthCheckResponse {
    const config = configuration();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: config.npmPackageVersion,
      details: {
        node: process.version,
        platform: process.platform,
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
        },
      },
    };
  }
} 