/**
 * Cache Middleware for NestJS applications.
 * Implements browser-side caching for GET requests to improve performance.
 *
 * Features:
 * - Differentiated caching strategies for static assets vs. dynamic pages
 * - Stale-while-revalidate support for improved perceived performance
 * - Environment-aware caching (development vs. production)
 * - Authentication-aware caching to prevent caching sensitive content
 * - Configurable cache durations via application configuration
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
   * - Applies stale-while-revalidate for improved performance
   * - Uses different caching strategies for static assets vs. dynamic pages
   *
   * The stale-while-revalidate directive allows browsers to use a cached response
   * immediately while fetching a fresh copy in the background. This significantly
   * improves perceived performance while ensuring content is kept up-to-date.
   */
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Skip caching for API routes
      if (req.path.startsWith('/api')) {
        return next();
      }

      let currentEnv: string;
      try {
        currentEnv = this.configService.get<string>('environment') || 'production';
      } catch (error) {
        // If config service fails, default to production settings
        currentEnv = 'production';
      }

      // Development mode: NO CACHING for any non-API GET routes (HTML pages, etc.)
      if (currentEnv === 'development') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache'); // HTTP/1.0 backward compatibility
        res.setHeader('Expires', '0'); // Proxies
      } else {
        // Production or other non-development modes:
        // Skip caching for authenticated routes to prevent caching sensitive user-specific content
        let isAuthenticated = false;
        try {
          isAuthenticated = req.isAuthenticated?.() || false;
        } catch (error) {
          // If auth check fails, treat as unauthenticated
          isAuthenticated = false;
        }

        if (isAuthenticated) {
          // For authenticated routes in non-development environments,
          // we won't set specific cache headers here, allowing other mechanisms or browser defaults.
          return next();
        }

        // Get cache durations from config with fallbacks
        let defaultMaxAge = 3600;
        let staticAssetMaxAge = 604800; // 7 days
        let staticAssetStaleTime = 86400; // 1 day
        let pageMaxAge = 3600;
        let pageStaleTime = 60; // 1 minute

        try {
          defaultMaxAge = this.configService.get<number>('performance.browserCache.maxAge') || defaultMaxAge;
          staticAssetMaxAge = this.configService.get<number>('performance.browserCache.staticAssets.maxAge') || staticAssetMaxAge;
          staticAssetStaleTime = this.configService.get<number>('performance.browserCache.staticAssets.staleWhileRevalidate') || staticAssetStaleTime;
          pageMaxAge = this.configService.get<number>('performance.browserCache.pages.maxAge') || defaultMaxAge;
          pageStaleTime = this.configService.get<number>('performance.browserCache.pages.staleWhileRevalidate') || pageStaleTime;
        } catch (error) {
          // If config service fails, use default values
        }

        // Apply different caching strategies based on resource type
        if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|woff|woff2)$/)) {
          // Long cache with stale-while-revalidate for static assets
          res.setHeader('Cache-Control', `public, max-age=${staticAssetMaxAge}, stale-while-revalidate=${staticAssetStaleTime}`);
        } else {
          // For public pages, shorter cache with stale-while-revalidate
          res.setHeader('Cache-Control', `public, max-age=${pageMaxAge}, stale-while-revalidate=${pageStaleTime}`);
        }
      }

      // Vary header is important for content negotiation (e.g., compression)
      res.setHeader('Vary', 'Accept-Encoding');

      next();
    } catch (error) {
      // If any unexpected error occurs, proceed without caching
      next();
    }
  }
}
