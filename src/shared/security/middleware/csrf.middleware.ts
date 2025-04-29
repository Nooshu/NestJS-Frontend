import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SecurityConfig } from '../../config/security.config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private securityConfig: SecurityConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.securityConfig.csrf.enabled) {
      return next();
    }

    // Skip CSRF check for excluded paths
    if (req.path.startsWith('/api/auth/')) {
      return next();
    }

    // Skip CSRF check for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const token = req.cookies[this.securityConfig.csrf.cookieName];
    const headerToken = req.headers[this.securityConfig.csrf.headerName.toLowerCase()];

    if (!token || !headerToken || token !== headerToken) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Invalid CSRF token',
      });
    }

    next();
  }
}
