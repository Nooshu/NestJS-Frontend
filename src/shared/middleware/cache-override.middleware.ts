/**
 * Cache Override Middleware
 * 
 * This middleware ensures that static assets get proper cache headers
 * regardless of other middleware or configuration issues.
 * 
 * It specifically targets static assets and overrides any existing
 * cache headers with optimal caching configuration.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CacheOverrideMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only process GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if this is a static asset
    const isStaticAsset = this.isStaticAsset(req.path);
    
    if (isStaticAsset) {
      // Override any existing cache headers for static assets
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable, stale-while-revalidate=2592000');
      res.setHeader('Vary', 'Accept-Encoding');
      
      // Log for debugging - this should appear in Render logs
      console.log(`🚀 Cache Override: Setting cache headers for ${req.path}`);
      console.log(`🚀 Headers set: Cache-Control=public, max-age=31536000, immutable, stale-while-revalidate=2592000`);
    } else if (this.isHtmlPage(req.path)) {
      // Set cache headers for HTML pages
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      res.setHeader('Vary', 'Accept-Encoding');
      
      console.log(`🚀 Cache Override: Setting page cache headers for ${req.path}`);
    }

    // Use res.writeHead to ensure headers are set before any response is sent
    const originalWriteHead = res.writeHead;
    res.writeHead = function(statusCode: number, statusMessage?: string | any, headers?: any) {
      if (isStaticAsset) {
        headers = headers || {};
        headers['Cache-Control'] = 'public, max-age=31536000, immutable, stale-while-revalidate=2592000';
        headers['Vary'] = 'Accept-Encoding';
        console.log(`🔥 WRITEHEAD Override: Setting cache headers for ${req.path}`);
      } else if (this.isHtmlPage(req.path)) {
        headers = headers || {};
        headers['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=3600';
        headers['Vary'] = 'Accept-Encoding';
        console.log(`🔥 WRITEHEAD Override: Setting page cache headers for ${req.path}`);
      }
      return originalWriteHead.call(this, statusCode, statusMessage, headers);
    }.bind(this);

    next();
  }

  private isStaticAsset(path: string): boolean {
    // Check for static asset extensions
    const staticExtensions = [
      '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
      '.woff', '.woff2', '.ttf', '.eot', '.webp', '.avif'
    ];
    
    return staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private isHtmlPage(path: string): boolean {
    // Check if this is an HTML page (not API routes)
    return !path.startsWith('/api') && 
           !path.startsWith('/health') && 
           !path.includes('.') && 
           path !== '/';
  }
}
