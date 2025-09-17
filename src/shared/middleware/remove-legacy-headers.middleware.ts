/**
 * Remove Legacy Headers Middleware
 * 
 * This middleware removes legacy security headers that don't provide meaningful security anymore.
 * It runs after Helmet to ensure these headers are removed from HTML responses.
 * 
 * Headers removed:
 * - X-DNS-Prefetch-Control
 * - X-Permitted-Cross-Domain-Policies  
 * - X-XSS-Protection
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RemoveLegacyHeadersMiddleware implements NestMiddleware {
  /**
   * Middleware implementation that removes legacy headers from HTML responses
   * 
   * @param {Request} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Only remove headers for HTML responses
    if (this.isHtmlResponse(req, res)) {
      // Remove legacy headers that don't provide meaningful security anymore
      res.removeHeader('X-DNS-Prefetch-Control');
      res.removeHeader('X-Permitted-Cross-Domain-Policies');
      res.removeHeader('X-XSS-Protection');
    }
    
    next();
  }

  /**
   * Check if this is an HTML response
   */
  private isHtmlResponse(req: Request, res: Response): boolean {
    // Check if request accepts HTML
    const acceptsHtml = Boolean(req.accepts('html'));
    
    // Check if response will be HTML (based on content-type)
    const contentType = res.getHeader('content-type') as string;
    const isHtmlContentType = Boolean(contentType?.includes('text/html'));
    
    // Check if this is likely an HTML page route (not API, health, or static assets)
    const path = req.path || '';
    const isHtmlRoute = !path.startsWith('/api') && 
                       !path.startsWith('/health') && 
                       !this.isStaticAsset(path) &&
                       !path.includes('.');
    
    return acceptsHtml || isHtmlContentType || isHtmlRoute;
  }

  /**
   * Check if the request is for a static asset
   */
  private isStaticAsset(path: string): boolean {
    const staticExtensions = [
      '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
      '.woff', '.woff2', '.ttf', '.eot', '.webp', '.avif', '.map'
    ];
    
    return staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }
}
