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

    const currentEnv = this.configService.get<string>('environment');

    // Development mode: NO CACHING for any non-API GET routes (HTML pages, etc.)
    if (currentEnv === 'development') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache'); // HTTP/1.0 backward compatibility
      res.setHeader('Expires', '0'); // Proxies
    } else {
      // Production or other non-development modes:
      // Skip caching for authenticated routes to prevent caching sensitive user-specific content
      if (req.isAuthenticated?.()) {
        // For authenticated routes in non-development environments, 
        // we won't set specific cache headers here, allowing other mechanisms or browser defaults.
        return next(); 
      }

      // For public (unauthenticated), non-API GET requests in non-development environments, apply caching.
      // The fallback to 3600 is used if 'performance.browserCache.maxAge' is not found in config.
      const cacheDuration = this.configService.get<number>('performance.browserCache.maxAge') || 3600;
      res.setHeader('Cache-Control', `public, max-age=${cacheDuration}`);
    }

    // Vary header is important for content negotiation (e.g., compression)
    // Set for all relevant GET requests that pass through this point.
    res.setHeader('Vary', 'Accept-Encoding');

    next();
  }
} 