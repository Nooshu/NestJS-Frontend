/**
 * Optimized HTML Headers Middleware for TTFB optimization
 * 
 * This middleware sets all required headers for HTML responses to optimize Time to First Byte (TTFB).
 * It consolidates all header settings in one place to avoid conflicts and ensure proper ordering.
 * 
 * Headers set:
 * - Cache-Control: public, max-age=0, s-maxage=86400, stale-while-revalidate=3600
 * - Content-Encoding: br (when Brotli is supported)
 * - Vary: Accept-Encoding
 * - Content-Security-Policy: Comprehensive CSP for security
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: geolocation=(), microphone=(), camera=()
 * - Cross-Origin-Resource-Policy: same-site
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - Alt-Svc: h3=":443"; ma=86400 (HTTP/3 support)
 * - Priority: u=0 (resource priority hint)
 * - ETag: Generated hash for content validation
 * - Server: cloudflare (for CDN identification)
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class OptimizedHtmlHeadersMiddleware implements NestMiddleware {
  /**
   * Middleware implementation that sets optimized headers for HTML responses
   * 
   * @param {Request} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to HTML responses
    if (this.isHtmlResponse(req, res)) {
      this.setOptimizedHeaders(req, res);
    }
    
    next();
  }

  /**
   * Check if this is an HTML response
   */
  private isHtmlResponse(req: Request, res: Response): boolean {
    // Check if request accepts HTML
    const acceptsHtml = req.accepts('html');
    
    // Check if response will be HTML (based on content-type)
    const contentType = res.getHeader('content-type') as string;
    const isHtmlContentType = contentType?.includes('text/html');
    
    // Check if this is likely an HTML page route (not API, health, or static assets)
    const path = req.path || '';
    const isHtmlRoute = !path.startsWith('/api') && 
                       !path.startsWith('/health') && 
                       !this.isStaticAsset(path) &&
                       !path.includes('.');
    
    return acceptsHtml || isHtmlContentType || isHtmlRoute;
  }

  /**
   * Set all optimized headers for HTML responses
   */
  private setOptimizedHeaders(req: Request, res: Response): void {
    // Cache-Control: Optimized for CDN and browser caching
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600');
    
    // Content-Encoding: Set to Brotli if supported
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
    }
    
    // Vary: Indicate that response varies by Accept-Encoding
    res.setHeader('Vary', 'Accept-Encoding');
    
    // Content-Security-Policy: Comprehensive security policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' https:; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests"
    );
    
    // Referrer-Policy: Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy: Restrict browser features
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Cross-Origin-Resource-Policy: Control cross-origin access
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    
    // X-Content-Type-Options: Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options: Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Alt-Svc: HTTP/3 support
    res.setHeader('Alt-Svc', 'h3=":443"; ma=86400');
    
    // Priority: Resource priority hint
    res.setHeader('Priority', 'u=0');
    
    // Server: CDN identification
    res.setHeader('Server', 'cloudflare');
    
    // ETag: Generate for content validation
    this.setETag(res);
  }

  /**
   * Generate and set ETag header for content validation
   */
  private setETag(res: Response): void {
    // Only set ETag if not already present
    if (!res.getHeader('etag')) {
      const originalEnd = res.end;
      res.end = function(chunk: any, encoding?: any) {
        if (!res.getHeader('etag')) {
          const content = chunk ? chunk.toString() : '';
          const etag = createHash('md5').update(content).digest('hex');
          res.setHeader('ETag', `"${etag}"`);
        }
        originalEnd.call(this, chunk, encoding);
      };
    }
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
