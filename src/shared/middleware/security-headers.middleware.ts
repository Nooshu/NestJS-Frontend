import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../config/security.config';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  constructor(
    private readonly securityConfig: SecurityConfig,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('SecurityHeadersMiddleware');
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in browsers (deprecated but still useful for older browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Enhanced Permissions Policy with more comprehensive restrictions
    const permissionsPolicy = [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=()',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', ');

    res.setHeader('Permissions-Policy', permissionsPolicy);

    // Referrer Policy for better privacy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Cross-Origin policies
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    // Prevent IE from executing downloads in your site's context
    res.setHeader('X-Download-Options', 'noopen');

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Add custom security identifier
    res.setHeader('X-Security-Enhanced', 'true');

    // HSTS (HTTP Strict Transport Security) for HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Disable caching for sensitive routes
    if (this.isSensitiveRoute(req.path)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');

      this.logger.debug('Applied no-cache headers to sensitive route', {
        path: req.path,
        method: req.method,
      });
    }

    // Enhanced security headers for API routes
    if (req.path.startsWith('/api')) {
      // Ensure JSON responses are not cached
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      // Additional API security headers
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

      // Rate limiting headers (will be overridden by rate limiting middleware if present)
      if (!res.getHeader('X-RateLimit-Limit')) {
        res.setHeader('X-RateLimit-Limit', '100');
        res.setHeader('X-RateLimit-Remaining', '99');
      }
    }

    // Enhanced CSP for HTML responses
    if (req.path.endsWith('.html') || req.accepts('html')) {
      const cspConfig = this.securityConfig.csp;
      if (cspConfig.enabled) {
        const cspDirectives = Object.entries(cspConfig.directives)
          .map(([key, value]) => `${this.kebabCase(key)} ${(value as string[]).join(' ')}`)
          .join('; ');

        res.setHeader('Content-Security-Policy', cspDirectives);

        this.logger.debug('Applied CSP headers', {
          path: req.path,
          csp: cspDirectives,
        });
      }
    }

    // Security headers for static assets
    if (this.isStaticAsset(req.path)) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    next();
  }

  private isSensitiveRoute(path: string): boolean {
    const sensitivePatterns = [
      '/api',
      '/auth',
      '/login',
      '/logout',
      '/admin',
      '/dashboard',
      '/profile',
      '/settings',
      '/account'
    ];

    return sensitivePatterns.some(pattern => path.startsWith(pattern));
  }

  private isStaticAsset(path: string): boolean {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => path.endsWith(ext));
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
