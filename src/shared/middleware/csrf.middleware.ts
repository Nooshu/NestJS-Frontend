import { Injectable, type NestMiddleware } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import type { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection: any;
  private cookieMiddleware: any;

  constructor(private readonly logger: LoggerService) {
    // First, set up cookie parser
    const cookieSecret = process.env.COOKIE_SECRET || 'your-secret-key';
    this.cookieMiddleware = cookieParser(cookieSecret);

    // Then set up CSRF protection
    this.csrfProtection = csrf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        key: '_csrf',
        path: '/',
      },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF check for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Parse cookies first
    this.cookieMiddleware(req, res, () => {
      this.csrfProtection(req, res, (err: any) => {
        if (err) {
          this.logger.error('CSRF token validation failed', err.stack, {
            path: req.path,
            method: req.method,
            ip: req.ip,
          });

          return res.status(403).json({
            statusCode: 403,
            message: 'Invalid CSRF token',
            error: 'Forbidden',
          });
        }

        // Add CSRF token to response for forms
        if (req.method === 'GET') {
          res.locals.csrfToken = req.csrfToken();
        }

        next();
        return;
      });
    });
  }
}
