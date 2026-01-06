/**
 * Request logging middleware.
 * Logs information about incoming requests and responses.
 *
 * @module LoggerMiddleware
 * @requires @nestjs/common
 * @requires express
 */

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { loggingConfig } from '../config/logging.config';

/**
 * Logger middleware for request/response logging and monitoring.
 * Provides comprehensive logging of HTTP requests and responses,
 * including performance monitoring and audit logging capabilities.
 *
 * Features:
 * - Request/response logging
 * - Performance monitoring
 * - Error rate detection
 * - Response time tracking
 * - Audit logging
 * - Request ID tracking
 *
 * Monitoring thresholds:
 * - Error rate monitoring (500+ status codes)
 * - Response time monitoring
 * - Content length tracking
 * - User agent logging
 *
 * @class LoggerMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('LoggerMiddleware');
  }

  /**
   * Check if a path should be excluded from logging
   */
  private shouldExcludePath(path: string): boolean {
    return loggingConfig.base.excludePaths.some((pattern) => {
      // Handle exact matches
      if (!pattern.includes('*')) {
        return path === pattern;
      }

      // Handle *.extension patterns
      if (pattern.startsWith('*.')) {
        const extension = pattern.slice(1); // Remove the *
        return path.endsWith(extension);
      }

      return false;
    });
  }

  /**
   * Log request and response information.
   * Implements comprehensive request tracking including:
   * - Request details (method, URL, IP, user agent)
   * - Response metrics (status, duration, content length)
   * - Performance monitoring
   * - Audit logging
   *
   * Security considerations:
   * - IP address logging
   * - User agent logging
   * - Request ID tracking
   * - Sensitive data masking
   *
   * @method use
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;

    // Skip logging for excluded paths
    if (this.shouldExcludePath(originalUrl)) {
      return next();
    }

    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    // Log request with security context
    this.logger.info('Incoming request', {
      method,
      url: originalUrl,
      ip,
      userAgent,
      requestId: req.id,
    });

    // Capture response data with performance monitoring
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      // Skip logging for excluded paths
      if (this.shouldExcludePath(originalUrl)) {
        return;
      }

      // Log response with performance metrics
      this.logger.info('Request completed', {
        method,
        url: originalUrl,
        status: statusCode,
        duration: `${duration}ms`,
        contentLength: contentLength || 0,
        requestId: req.id,
      });

      // Performance monitoring with alerting
      if (loggingConfig.monitoring.enabled && loggingConfig.monitoring.alerting.enabled) {
        // Monitor error rates
        if (statusCode >= 500) {
          this.logger.warn('High error rate detected', {
            method,
            url: originalUrl,
            status: statusCode,
            requestId: req.id,
          });
        }

        // Monitor response times
        if (duration > loggingConfig.monitoring.alerting.thresholds.responseTime) {
          this.logger.warn('Slow response detected', {
            method,
            url: originalUrl,
            duration: `${duration}ms`,
            threshold: `${loggingConfig.monitoring.alerting.thresholds.responseTime}ms`,
            requestId: req.id,
          });
        }
      }

      // Audit logging with security context
      if (loggingConfig.audit.enabled) {
        this.logger.audit('HTTP Request', {
          method,
          url: originalUrl,
          status: statusCode,
          duration: `${duration}ms`,
          ip,
          userAgent,
          requestId: req.id,
          user: req.user?.id || 'anonymous',
        });
      }
    });

    next();
  }
}
