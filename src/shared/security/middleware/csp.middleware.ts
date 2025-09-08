import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SecurityConfig } from '../../config/security.config';

@Injectable()
export class CspMiddleware implements NestMiddleware {
  constructor(private securityConfig: SecurityConfig) {}

  use(_req: Request, res: Response, next: NextFunction) {
    if (!this.securityConfig.csp.enabled) {
      return next();
    }

    // Set CSP headers
    const directives = this.securityConfig.csp.directives;
    
    // Handle case where directives is null/undefined
    if (!directives) {
      return next();
    }
    
    const cspHeader = Object.entries(directives)
      .map(([key, value]) => {
        // Handle different value types
        if (Array.isArray(value)) {
          return `${key} ${value.join(' ')}`;
        } else if (typeof value === 'string') {
          return `${key} ${value}`;
        } else if (value === null || value === undefined) {
          return `${key} 'none'`;
        } else {
          // Convert other types to string
          return `${key} ${String(value)}`;
        }
      })
      .join('; ');

    res.setHeader('Content-Security-Policy', cspHeader);
    next();
  }
}
