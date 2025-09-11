/**
 * Final Cache Override Middleware
 * 
 * This middleware runs at the very end of the middleware chain
 * to ensure it overrides ANY cache headers set by other middleware.
 * 
 * It uses res.on('finish') to set headers just before the response is sent.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FinalCacheOverrideMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only process GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if this is a static asset
    const isStaticAsset = this.isStaticAsset(req.path);
    
    if (isStaticAsset) {
      // Use res.on('finish') to set headers just before response is sent
      // This ensures it overrides any other cache headers
      res.on('finish', () => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable, stale-while-revalidate=2592000');
        res.setHeader('Vary', 'Accept-Encoding');
        
        console.log(`🔥 FINAL Cache Override: Setting cache headers for ${req.path}`);
        console.log(`🔥 FINAL Headers: Cache-Control=public, max-age=31536000, immutable, stale-while-revalidate=2592000`);
      });
    } else if (this.isHtmlPage(req.path)) {
      res.on('finish', () => {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        res.setHeader('Vary', 'Accept-Encoding');
        
        console.log(`🔥 FINAL Cache Override: Setting page cache headers for ${req.path}`);
      });
    }

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
