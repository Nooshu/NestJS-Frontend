import { Injectable, type NestMiddleware } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { createHmac, randomBytes } from 'crypto';

// Extend the Express Request type to include csrfToken
interface RequestWithCsrf extends Request {
  csrfToken?: () => string;
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private cookieMiddleware: any;
  private secret: Buffer;
  private csrfProtection: any;

  constructor(private readonly logger: LoggerService) {
    // Set up cookie parser
    const cookieSecret = process.env.COOKIE_SECRET || 'your-secret-key';
    this.cookieMiddleware = cookieParser(cookieSecret);
    
    // Generate a secure secret for CSRF tokens
    this.secret = randomBytes(32);
  }

  private generateToken(req?: RequestWithCsrf): string {
    // If we're in test mode and have a mock token generator, use it
    if (req?.csrfToken) {
      return req.csrfToken();
    }

    // Otherwise generate a real token
    const salt = randomBytes(8);
    const hmac = createHmac('sha256', this.secret);
    hmac.update(salt);
    const hash = hmac.digest();
    return `${salt.toString('hex')}.${hash.toString('hex')}`;
  }

  private verifyToken(token: string, providedToken: string): boolean {
    try {
      if (!token || !providedToken || token !== providedToken) return false;
      return true;
    } catch {
      return false;
    }
  }

  private handleError(res: Response, error?: Error) {
    this.logger.error('CSRF token validation error', error?.stack || 'Unknown error');
    return res.status(403).json({
      statusCode: 403,
      message: 'Invalid CSRF token',
      error: 'Forbidden',
    });
  }

  use(req: RequestWithCsrf, res: Response, next: NextFunction): void {
    // Skip CSRF check for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Parse cookies first
    this.cookieMiddleware(req, res, () => {
      try {
        // For GET requests, generate a new token
        if (req.method === 'GET') {
          // If we have a mock CSRF protection function (for testing), use it first
          if (this.csrfProtection) {
            this.csrfProtection(req, res, (error?: Error) => {
              if (error) {
                return this.handleError(res, error);
              }
              return undefined;
            });
          }

          const token = this.generateToken(req);
          res.cookie('_csrf', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
          });
          res.locals.csrfToken = token;
          return next();
        }

        // For other methods that need CSRF protection
        if (!['HEAD', 'OPTIONS'].includes(req.method)) {
          const token = req.cookies._csrf;
          const headerToken = req.headers['csrf-token'] as string;

          if (!this.verifyToken(token, headerToken)) {
            return this.handleError(res);
          }

          // If we have a mock CSRF protection function (for testing), use it
          if (this.csrfProtection) {
            this.csrfProtection(req, res, (error?: Error) => {
              if (error) {
                return this.handleError(res, error);
              }
              return next();
            });
            return;
          }
        }

        return next();
      } catch (error: unknown) {
        return this.handleError(res, error instanceof Error ? error : undefined);
      }
    });
  }
}
