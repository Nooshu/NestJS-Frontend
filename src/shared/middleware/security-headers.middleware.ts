import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Control browser features
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );
    
    // Prevent browsers from performing MIME sniffing
    res.setHeader('X-Download-Options', 'noopen');
    
    // Prevent IE from executing downloads in your site's context
    res.setHeader('X-Download-Options', 'noopen');
    
    // Disable caching for sensitive routes
    if (req.path.startsWith('/api') || req.path.includes('/auth')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    
    // Add security headers for API routes
    if (req.path.startsWith('/api')) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  }
} 