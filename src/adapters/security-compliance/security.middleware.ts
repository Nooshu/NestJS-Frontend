import cors from 'cors';
import type { Application, NextFunction, Request, RequestHandler, Response } from 'express';
import helmet from 'helmet';
import { CacheService } from './cache.service';
import type { CacheConfig, CacheKey } from './cache.types';
import { securityErrorHandler } from './error.handler';
import { SecurityError, SecurityErrorCode } from './error.types';
import type { MaxValue, RateLimitOptions, SecurityConfig } from './security.types';

function isValidRateLimitConfig(config: unknown): config is RateLimitOptions {
  if (!config || typeof config !== 'object') return false;
  const { windowMs, max, enabled } = config as Record<string, unknown>;
  return typeof windowMs === 'number' && typeof max === 'number' && typeof enabled === 'boolean';
}

async function getMaxRequests(max: MaxValue, req: Request, res: Response): Promise<number> {
  if (typeof max === 'number') {
    return max;
  }
  const result = max(req, res);
  return result instanceof Promise ? await result : result;
}

/**
 * Applies government security standards to the Express application
 */
export function applyGovernmentSecurity(app: Application, config: SecurityConfig): void {
  // Apply Helmet security headers
  if (config.helmet) {
    app.use(helmet(typeof config.helmet === 'boolean' ? {} : config.helmet));
  }

  // Apply CORS
  if (config.cors) {
    app.use(cors(config.cors));
  }

  // Apply custom headers
  if (config.headers) {
    app.use((_req: Request, res: Response, next: NextFunction) => {
      Object.entries(config.headers || {}).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      next();
    });
  }

  // Apply rate limiting
  if (config.rateLimit && isValidRateLimitConfig(config.rateLimit)) {
    const { windowMs, max } = config.rateLimit;

    const cache = new CacheService({
      enabled: true,
      ttl: windowMs / 1000,
      prefix: 'rate-limit',
      store: 'memory',
    });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'rate-limit',
          identifier: req.ip || 'unknown',
          timestamp: Math.floor(Date.now() / windowMs),
        };

        const cachedCount = (await cache.get<number>(key)) || 0;
        const maxRequests = await getMaxRequests(max, req, res);

        if (cachedCount >= maxRequests) {
          res.status(429).json({ error: 'Too many requests' });
          return;
        }

        await cache.set(key, cachedCount + 1, windowMs / 1000);
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  // Apply password policy
  if (config.passwordPolicy) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/register' && req.method === 'POST') {
        const { password } = req.body;
        if (!password || !validatePassword(password, config.passwordPolicy!)) {
          res.status(400).json({ error: 'Invalid password' });
          return;
        }
      }
      next();
    });
  }

  // Apply audit logging
  if (config.audit?.enabled) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        const auditData = {
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        };
        console.log('Audit:', auditData);
      });
      next();
    });
  }

  // Apply data protection
  if (config.dataProtection?.masking.enabled) {
    app.use((_req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      res.json = function (data: any) {
        if (typeof data === 'object') {
          const maskedData = excludeFields(data, config.dataProtection?.masking.fields || []);
          return originalJson.call(this, maskedData);
        }
        return originalJson.call(this, data);
      };
      next();
    });
  }

  const middleware = securityMiddleware(config);
  middleware.forEach((m) => app.use(m));
  app.use(securityErrorHandler);
}

// Helper functions
const validatePassword = (
  password: string,
  policy: NonNullable<SecurityConfig['passwordPolicy']>
): boolean => {
  if (password.length < policy.minLength) return false;
  if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
  if (policy.requireNumbers && !/[0-9]/.test(password)) return false;
  if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) return false;
  return true;
};

const getHelmetHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

const excludeFields = (
  data: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> => {
  const result = { ...data };
  fields.forEach((field) => {
    if (field in result) {
      result[field] = '********';
    }
  });
  return result;
};

/**
 * Security middleware factory for creating a comprehensive security middleware stack.
 * Implements multiple security layers including rate limiting, CORS protection,
 * security headers, and audit logging.
 *
 * Security features:
 * - Rate limiting with configurable windows
 * - CORS protection with strict origin validation
 * - Security headers via Helmet.js
 * - Audit logging with sensitive data masking
 * - Request validation
 * - Error handling
 *
 * Configuration options:
 * - Rate limit settings
 * - CORS policy
 * - Security headers
 * - Audit logging
 * - Cache settings
 *
 * @param {SecurityConfig} config - Security configuration object
 * @returns {RequestHandler[]} Array of security middleware functions
 */
export const securityMiddleware = (config: SecurityConfig) => {
  const cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 300,
    prefix: 'gov-security',
    store: 'memory',
  };

  const cache = new CacheService(cacheConfig);

  const middleware: RequestHandler[] = [];

  // Rate limiting with cache and error handling
  if (config.rateLimit) {
    middleware.push(async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'rate-limit',
          identifier: req.ip || 'unknown',
          timestamp: Math.floor(Date.now() / config.rateLimit!.windowMs),
        };

        const cachedCount = (await cache.get<number>(key)) || 0;

        if (cachedCount >= config.rateLimit!.max) {
          throw new SecurityError(SecurityErrorCode.RATE_LIMIT_EXCEEDED, 'Too many requests', {
            path: req.path,
            ip: req.ip ?? '',
            metadata: {
              limit: config.rateLimit!.max,
              windowMs: config.rateLimit!.windowMs,
            },
          });
        }

        await cache.set(key, cachedCount + 1, config.rateLimit!.windowMs / 1000);
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  // Password policy validation with cache and error handling
  if (config.passwordPolicy) {
    middleware.push(async (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (req.path === '/auth/register' && req.method === 'POST') {
          const { password } = req.body as { password: string };
          const key: CacheKey = {
            type: 'password-policy',
            identifier: password,
          };

          const cachedResult = await cache.get<boolean>(key);
          if (cachedResult !== null) {
            if (!cachedResult) {
              throw new SecurityError(
                SecurityErrorCode.PASSWORD_POLICY_VIOLATION,
                'Password does not meet policy requirements',
                {
                  path: req.path,
                  ip: req.ip ?? '',
                  metadata: {
                    policy: config.passwordPolicy,
                  },
                }
              );
            }
            return next();
          }

          const isValid = validatePassword(password, config.passwordPolicy!);
          await cache.set(key, isValid, 3600);

          if (!isValid) {
            throw new SecurityError(
              SecurityErrorCode.PASSWORD_POLICY_VIOLATION,
              'Password does not meet policy requirements',
              {
                path: req.path,
                ip: req.ip ?? '',
                metadata: {
                  policy: config.passwordPolicy,
                },
              }
            );
          }
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  // Security headers with cache and error handling
  if (config.helmet || config.headers) {
    middleware.push(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'security-headers',
          identifier: req.path,
        };

        const cachedHeaders = await cache.get<Record<string, string>>(key);
        if (cachedHeaders) {
          Object.entries(cachedHeaders).forEach(([headerKey, value]) => {
            res.setHeader(headerKey, value);
          });
          return next();
        }

        const headers = {
          ...(config.helmet ? getHelmetHeaders() : {}),
          ...(config.headers || {}),
        };

        await cache.set(key, headers, 3600);
        Object.entries(headers).forEach(([headerKey, value]) => {
          res.setHeader(headerKey, String(value));
        });
        next();
      } catch (error) {
        next(
          new SecurityError(
            SecurityErrorCode.SECURITY_HEADER_ERROR,
            'Failed to set security headers',
            {
              path: req.path,
              ip: req.ip ?? '',
              metadata: {
                originalError: error instanceof Error ? error.message : 'Unknown error',
              },
            }
          )
        );
      }
    });
  }

  // Audit logging with cache and error handling
  if (config.audit?.enabled) {
    middleware.push(async (req: Request, _res: Response, next: NextFunction) => {
      try {
        // Create cache key for audit log deduplication
        const key: CacheKey = {
          type: 'audit-log',
          identifier: `${req.method}:${req.path}`,
          timestamp: Math.floor(Date.now() / 60000), // Round to minute
        };

        // Check cache to prevent duplicate logs
        const cachedLog = await cache.get<boolean>(key);
        if (cachedLog) {
          return next();
        }

        // Prepare audit log data with sensitive data handling
        const logData = {
          timestamp: new Date(),
          method: req.method,
          path: req.path,
          ip: req.ip || 'unknown',
          ...(config.audit?.excludeFields
            ? excludeFields(req.body as Record<string, unknown>, config.audit.excludeFields)
            : {}),
        };

        // Cache audit log entry to prevent duplicates
        await cache.set(key, true, 60); // Cache for 1 minute
        console.log('Audit Log:', logData);
        next();
      } catch (error) {
        // Handle audit logging errors with proper error context
        next(
          new SecurityError(SecurityErrorCode.AUDIT_LOG_FAILURE, 'Failed to log audit entry', {
            path: req.path,
            ip: req.ip ?? '',
            metadata: {
              originalError: error instanceof Error ? error.message : 'Unknown error',
            },
          })
        );
      }
    });
  }

  return middleware;
};

export const rateLimitMiddleware = (config: SecurityConfig): RequestHandler => {
  if (!config.rateLimit || !isValidRateLimitConfig(config.rateLimit)) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  const { windowMs, max } = config.rateLimit;
  const cache = new CacheService({
    enabled: true,
    ttl: windowMs / 1000,
    prefix: 'rate-limit',
    store: 'memory',
  });

  const middleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key: CacheKey = {
        type: 'rate-limit',
        identifier: req.ip || 'unknown',
        timestamp: Math.floor(Date.now() / windowMs),
      };

      const cachedCount = (await cache.get<number>(key)) || 0;
      const maxRequests = await getMaxRequests(max, req, res);

      if (cachedCount >= maxRequests) {
        res.status(429).json({ error: 'Too many requests' });
        return;
      }

      await cache.set(key, cachedCount + 1, windowMs / 1000);
      next();
    } catch (error) {
      next(error);
    }
  };

  return middleware;
};

export const auditMiddleware = (config: SecurityConfig): RequestHandler => {
  const { audit } = config;
  if (!audit?.enabled) {
    return (_req, _res, next) => next();
  }

  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const requestData = {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString(),
      };

      // Filter out excluded fields
      if (audit.excludeFields?.length) {
        audit.excludeFields.forEach((field) => {
          delete requestData.body[field];
        });
      }

      // Log the audit data (implement your logging logic here)
      console.log('Audit Log:', requestData);
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const dataProtectionMiddleware = (config: SecurityConfig): RequestHandler => {
  const { dataProtection } = config;
  if (!dataProtection?.enabled) {
    return (_req, _res, next) => next();
  }

  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Mask sensitive fields in the response
      const originalSend = res.send;
      res.send = function (body) {
        if (body && dataProtection.masking?.fields?.length) {
          const maskedBody = { ...body };
          dataProtection.masking.fields.forEach((field: string) => {
            if (maskedBody[field]) {
              maskedBody[field] = '********';
            }
          });
          return originalSend.call(this, maskedBody);
        }
        return originalSend.call(this, body);
      };
      next();
    } catch (err) {
      next(err);
    }
  };
};
