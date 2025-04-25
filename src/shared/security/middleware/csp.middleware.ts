import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../../config/security.config';

@Injectable()
export class CspMiddleware implements NestMiddleware {
  constructor(private securityConfig: SecurityConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.securityConfig.csp.enabled) {
      return next();
    }

    // Set CSP headers
    const directives = this.securityConfig.csp.directives;
    const cspHeader = Object.entries(directives)
      .map(([key, value]) => `${key} ${(value as string[]).join(' ')}`)
      .join('; ');

    res.setHeader('Content-Security-Policy', cspHeader);
    next();
  }
} 