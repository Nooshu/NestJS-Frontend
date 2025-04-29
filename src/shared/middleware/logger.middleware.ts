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
 * Request logging middleware.
 *
 * @class LoggerMiddleware
 * @description Logs request and response information
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('LoggerMiddleware');
  }

  /**
   * Log request and response information.
   *
   * @method use
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    // Log request
    this.logger.info('Incoming request', {
      method,
      url: originalUrl,
      ip,
      userAgent,
      requestId: req.id,
    });

    // Capture response data
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      // Log response
      this.logger.info('Request completed', {
        method,
        url: originalUrl,
        status: statusCode,
        duration: `${duration}ms`,
        contentLength: contentLength || 0,
        requestId: req.id,
      });

      // Check monitoring thresholds
      if (loggingConfig.monitoring.enabled && loggingConfig.monitoring.alerting.enabled) {
        // Check error rate
        if (statusCode >= 500) {
          this.logger.warn('High error rate detected', {
            method,
            url: originalUrl,
            status: statusCode,
            requestId: req.id,
          });
        }

        // Check response time
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

      // Log audit event if enabled
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
