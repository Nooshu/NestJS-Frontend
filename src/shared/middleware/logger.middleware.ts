/**
 * Request logging middleware.
 * Logs information about incoming requests and responses.
 * 
 * @module LoggerMiddleware
 * @requires @nestjs/common
 * @requires express
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware.
 * 
 * @class LoggerMiddleware
 * @description Logs request and response information
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

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

    // Log request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture response data
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      // Log response
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ${contentLength || 0}b`,
      );
    });

    next();
  }
} 