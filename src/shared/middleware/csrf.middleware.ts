import { Injectable, type NestMiddleware } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { createHmac, randomBytes } from 'crypto';
import { SecurityConfig } from '../config/security.config';

// Extend the Express Request type to include csrfToken
interface RequestWithCsrf extends Request {
  csrfToken?: () => string;
}

type SameSite = 'strict' | 'lax' | 'none';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private cookieMiddleware: any;
  private secret: Buffer;
  private cookieName: string;
  private cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: SameSite;
    path: string;
  };

  constructor(
    private readonly logger: LoggerService,
    private readonly securityConfig: SecurityConfig
  ) {
    // Set up cookie parser
    const cookieSecret = process.env.COOKIE_SECRET || randomBytes(32).toString('hex');
    this.cookieMiddleware = cookieParser(cookieSecret);
    
    // Generate a secure secret for CSRF tokens
    this.secret = randomBytes(32);

    // Get configuration values from security config
    const csrfConfig = this.securityConfig.csrf;
    this.cookieName = csrfConfig.cookieName;
    this.cookieOptions = {
      ...csrfConfig.cookieOptions,
      sameSite: csrfConfig.cookieOptions.sameSite as SameSite,
      path: '/'
    };

    this.logger.setContext('CsrfMiddleware');
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
      if (!token || !providedToken) {
        this.logger.debug('CSRF token validation failed: missing token', {
          hasCookieToken: !!token,
          hasHeaderToken: !!providedToken
        });
        return false;
      }
      if (token !== providedToken) {
        this.logger.debug('CSRF token validation failed: token mismatch', {
          cookieToken: token.substring(0, 8) + '...',
          headerToken: providedToken.substring(0, 8) + '...'
        });
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('CSRF token validation error', error instanceof Error ? error.stack : 'Unknown error');
      return false;
    }
  }

  private handleError(res: Response, error?: Error, details?: Record<string, any>) {
    const errorDetails = {
      ...details,
      message: error?.message
    };
    this.logger.error(
      'CSRF token validation error',
      error?.stack,
      errorDetails
    );
    return res.status(403).json({
      statusCode: 403,
      message: 'Invalid CSRF token',
      error: 'Forbidden',
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }

  use(req: RequestWithCsrf, res: Response, next: NextFunction): void {
    // Skip CSRF check if disabled in config
    if (!this.securityConfig.csrf.enabled) {
      this.logger.debug('CSRF protection is disabled');
      return next();
    }

    // Skip CSRF check for API routes
    if (req.path.startsWith('/api/')) {
      this.logger.debug('Skipping CSRF check for API route', { path: req.path });
      return next();
    }

    // Parse cookies first
    this.cookieMiddleware(req, res, () => {
      try {
        // For GET requests, generate a new token
        if (req.method === 'GET') {
          const token = this.generateToken(req);
          const cookieOptions = {
            ...this.cookieOptions,
            sameSite: this.cookieOptions.sameSite
          };
          
          this.logger.debug('Setting CSRF cookie', {
            path: req.path,
            method: req.method,
            tokenPrefix: token.substring(0, 8) + '...',
            cookieName: this.cookieName,
            cookieOptions,
            cookieHeader: res.getHeader('Set-Cookie')
          });

          // Set the cookie with explicit options
          res.cookie(this.cookieName, token, {
            ...cookieOptions,
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
          });

          // Log the cookie after setting
          this.logger.debug('CSRF cookie set', {
            cookieHeader: res.getHeader('Set-Cookie'),
            cookieName: this.cookieName,
            tokenPrefix: token.substring(0, 8) + '...'
          });

          res.locals.csrfToken = token;
          return next();
        }

        // For other methods that need CSRF protection
        if (!['HEAD', 'OPTIONS'].includes(req.method)) {
          const token = req.cookies[this.cookieName];
          const formToken = req.body?._csrf;

          // Log all cookies and form data for debugging
          this.logger.debug('Request data', {
            path: req.path,
            method: req.method,
            cookieName: this.cookieName,
            hasCookieToken: !!token,
            hasFormToken: !!formToken,
            cookieTokenPrefix: token ? token.substring(0, 8) + '...' : undefined,
            formTokenPrefix: formToken ? formToken.substring(0, 8) + '...' : undefined,
            cookieHeader: req.headers.cookie,
            body: req.body
          });

          this.logger.debug('Validating CSRF token', {
            path: req.path,
            method: req.method,
            cookieName: this.cookieName,
            hasCookieToken: !!token,
            hasFormToken: !!formToken,
            cookieTokenPrefix: token ? token.substring(0, 8) + '...' : undefined,
            formTokenPrefix: formToken ? formToken.substring(0, 8) + '...' : undefined
          });

          if (!this.verifyToken(token, formToken)) {
            return this.handleError(res, new Error('CSRF token validation failed'), {
              path: req.path,
              method: req.method,
              cookieName: this.cookieName,
              hasCookieToken: !!token,
              hasFormToken: !!formToken,
              cookieTokenPrefix: token ? token.substring(0, 8) + '...' : undefined,
              formTokenPrefix: formToken ? formToken.substring(0, 8) + '...' : undefined,
              allCookies: Object.keys(req.cookies),
              cookieHeader: req.headers.cookie,
              body: req.body
            });
          }

          this.logger.debug('CSRF token validation successful', {
            path: req.path,
            method: req.method,
            cookieTokenPrefix: token.substring(0, 8) + '...',
            formTokenPrefix: formToken.substring(0, 8) + '...'
          });
        }

        return next();
      } catch (error: unknown) {
        return this.handleError(res, error instanceof Error ? error : undefined, {
          path: req.path,
          method: req.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    });
  }
}
