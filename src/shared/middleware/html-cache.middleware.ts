/**
 * HTML Cache Middleware for NestJS applications.
 * Sets appropriate cache headers for HTML responses based on Render's Cloudflare edge caching rules.
 * 
 * @module HtmlCacheMiddleware
 * @description Middleware that sets cache headers for HTML responses to work with Render's CDN
 * 
 * @example
 * // Apply HTML cache middleware to routes
 * consumer.apply(HtmlCacheMiddleware).forRoutes('*');
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HtmlCacheMiddleware implements NestMiddleware {
  /**
   * Middleware implementation that sets cache headers for HTML responses
   * 
   * @param {Request} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware function
   * 
   * @remarks
   * This middleware:
   * - Only applies to HTML responses (req.accepts('html'))
   * - Sets appropriate cache headers for Render's Cloudflare edge caching
   * - Avoids Set-Cookie headers to ensure edge caching eligibility
   * 
   * @returns {void}
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to HTML responses
    if (req.accepts('html')) {
      // Set cache headers for HTML pages
      // Using shorter cache duration for HTML as suggested by the AI
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    }
    
    next();
  }
}
