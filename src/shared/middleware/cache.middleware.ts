/**
 * Cache Middleware for NestJS applications.
 * Implements browser-side caching for GET requests to improve performance.
 * 
 * @module CacheMiddleware
 * @description Middleware that sets appropriate cache headers for GET requests
 * 
 * @example
 * // Apply cache middleware to routes
 * consumer.apply(CacheMiddleware).forRoutes({ path: '*path', method: RequestMethod.GET });
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Extended Request interface that includes authentication method
 * @interface AuthenticatedRequest
 * @extends {Request}
 */
interface AuthenticatedRequest extends Request {
  isAuthenticated?: () => boolean;
}

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  /**
   * Middleware implementation that sets cache headers for GET requests
   * 
   * @param {AuthenticatedRequest} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware function
   * 
   * @remarks
   * This middleware:
   * - Skips caching for non-GET requests
   * - Skips caching for API routes
   * - Skips caching for authenticated routes
   * - Sets cache headers with configurable duration
   */
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for API routes
    if (req.path.startsWith('/api')) {
      return next();
    }

    // Skip caching for authenticated routes
    if (req.isAuthenticated?.()) {
      return next();
    }

    // Get cache duration from config or use default (1 hour)
    const cacheDuration = this.configService.get('performance.browserCache.maxAge') || 3600;

    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${cacheDuration}`);
    res.setHeader('Vary', 'Accept-Encoding');

    next();
  }
} 