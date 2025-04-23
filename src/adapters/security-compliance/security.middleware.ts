import { Request, Response, NextFunction, RequestHandler, Application } from 'express';
import { SecurityConfig, RequestWithUser, MaxValue, CacheStore, RateLimitOptions, DataProtectionConfig, AuditConfig } from './security.types';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { CacheConfig, CacheKey } from './cache.types';
import { CacheService } from './cache.service';
import { SecurityError, SecurityErrorCode } from './error.types';
import { securityErrorHandler } from './error.handler';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

function isValidRateLimitConfig(config: unknown): config is RateLimitOptions {
  if (!config || typeof config !== 'object') return false;
  const { windowMs, max, enabled } = config as Record<string, unknown>;
  return typeof windowMs === 'number' && 
         typeof max === 'number' &&
         typeof enabled === 'boolean';
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
    app.use((req: Request, res: Response, next: NextFunction) => {
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
      store: 'memory'
    });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'rate-limit',
          identifier: req.ip || 'unknown',
          timestamp: Math.floor(Date.now() / windowMs)
        };

        const cachedCount = await cache.get<number>(key) || 0;
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
    app.use((req: Request, res: Response, next: NextFunction) => {
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
  middleware.forEach(m => app.use(m));
  app.use(securityErrorHandler);
}

/**
 * Password policy validation middleware
 */
function validatePasswordPolicy(config: Required<SecurityConfig>) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.path === '/auth/register' && req.method === 'POST') {
      const { password } = req.body as { password?: string };
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const policy = config.passwordPolicy;
      if (password.length < policy.minLength) {
        return res.status(400).json({ error: 'Password too short' });
      }
      
      if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain uppercase letter' });
      }
      
      if (policy.requireLowercase && !/[a-z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain lowercase letter' });
      }
      
      if (policy.requireNumbers && !/\d/.test(password)) {
        return res.status(400).json({ error: 'Password must contain number' });
      }
      
      if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain special character' });
      }
    }
    next();
  };
}

/**
 * Data protection middleware
 */
function protectSensitiveData(config: Required<SecurityConfig>) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { masking } = config.dataProtection;
    if (masking.enabled && Array.isArray(masking.fields)) {
      const originalJson = res.json;
      res.json = function(data: unknown) {
        if (typeof data === 'object' && data !== null) {
          const maskedData = maskSensitiveFields(data as Record<string, unknown>, masking.fields);
          return originalJson.call(this, maskedData);
        }
        return originalJson.call(this, data);
      };
    }
    next();
  };
}

function maskSensitiveFields(data: unknown, fields: string[]): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveFields(item, fields));
  }

  const masked = { ...data as Record<string, unknown> };
  for (const field of fields) {
    if (field in masked) {
      masked[field] = '********';
    }
  }

  return masked;
}

function auditLogging(config: Required<SecurityConfig>) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const audit = config.audit;
    if (audit.enabled) {
      const timestamp = new Date().toISOString();
      const userId = req.user?.id || 'anonymous';
      const action = `${req.method} ${req.path}`;
      
      console.log(`[${timestamp}] User ${userId} performed ${action}`);
    }
    next();
  };
}

// Helper functions
const validatePassword = (password: string, policy: NonNullable<SecurityConfig['passwordPolicy']>): boolean => {
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
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
});

const excludeFields = (data: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const result = { ...data };
  fields.forEach(field => {
    if (field in result) {
      result[field] = '********';
    }
  });
  return result;
};

/**
 * Creates an array of security middleware functions with error handling.
 * Each middleware function is wrapped in a try-catch block to ensure proper error handling.
 * 
 * @param config - The security configuration object
 * @returns An array of Express middleware functions
 */
export const securityMiddleware = (config: SecurityConfig) => {
  const cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 300,
    prefix: 'gov-security',
    store: 'memory'
  };

  const cache = new CacheService(cacheConfig);

  const middleware: RequestHandler[] = [];

  // Rate limiting with cache and error handling
  if (config.rateLimit) {
    middleware.push(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'rate-limit',
          identifier: req.ip || 'unknown',
          timestamp: Math.floor(Date.now() / config.rateLimit!.windowMs)
        };

        const cachedCount = await cache.get<number>(key) || 0;
        
        if (cachedCount >= config.rateLimit!.max) {
          throw new SecurityError(
            SecurityErrorCode.RATE_LIMIT_EXCEEDED,
            'Too many requests',
            {
              path: req.path,
              ip: req.ip,
              metadata: {
                limit: config.rateLimit!.max,
                windowMs: config.rateLimit!.windowMs
              }
            }
          );
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
    middleware.push(async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.path === '/auth/register' && req.method === 'POST') {
          const { password } = req.body as { password: string };
          const key: CacheKey = {
            type: 'password-policy',
            identifier: password
          };

          const cachedResult = await cache.get<boolean>(key);
          if (cachedResult !== null) {
            if (!cachedResult) {
              throw new SecurityError(
                SecurityErrorCode.PASSWORD_POLICY_VIOLATION,
                'Password does not meet policy requirements',
                {
                  path: req.path,
                  ip: req.ip,
                  metadata: {
                    policy: config.passwordPolicy
                  }
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
                ip: req.ip,
                metadata: {
                  policy: config.passwordPolicy
                }
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
          identifier: req.path
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
          ...(config.headers || {})
        };

        await cache.set(key, headers, 3600);
        Object.entries(headers).forEach(([headerKey, value]) => {
          res.setHeader(headerKey, String(value));
        });
        next();
      } catch (error) {
        next(new SecurityError(
          SecurityErrorCode.SECURITY_HEADER_ERROR,
          'Failed to set security headers',
          {
            path: req.path,
            ip: req.ip,
            metadata: {
              originalError: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        ));
      }
    });
  }

  // Audit logging with cache and error handling
  if (config.audit?.enabled) {
    middleware.push(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key: CacheKey = {
          type: 'audit-log',
          identifier: `${req.method}:${req.path}`,
          timestamp: Math.floor(Date.now() / 60000)
        };

        const cachedLog = await cache.get<boolean>(key);
        if (cachedLog) {
          return next();
        }

        const logData = {
          timestamp: new Date(),
          method: req.method,
          path: req.path,
          ip: req.ip || 'unknown',
          ...(config.audit?.excludeFields ? excludeFields(req.body as Record<string, unknown>, config.audit.excludeFields) : {})
        };

        await cache.set(key, true, 60);
        console.log('Audit Log:', logData);
        next();
      } catch (error) {
        next(new SecurityError(
          SecurityErrorCode.AUDIT_LOG_FAILURE,
          'Failed to log audit entry',
          {
            path: req.path,
            ip: req.ip,
            metadata: {
              originalError: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        ));
      }
    });
  }

  return middleware;
};

export const rateLimitMiddleware = (config: SecurityConfig): RequestHandler => {
  if (!config.rateLimit || !isValidRateLimitConfig(config.rateLimit)) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  const { windowMs, max } = config.rateLimit;
  const cache = new CacheService({
    enabled: true,
    ttl: windowMs / 1000,
    prefix: 'rate-limit',
    store: 'memory'
  });

  const middleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key: CacheKey = {
        type: 'rate-limit',
        identifier: req.ip || 'unknown',
        timestamp: Math.floor(Date.now() / windowMs)
      };

      const cachedCount = await cache.get<number>(key) || 0;
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
    return (req, res, next) => next();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData = {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
      };

      // Filter out excluded fields
      if (audit.excludeFields?.length) {
        audit.excludeFields.forEach(field => {
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
    return (req, res, next) => next();
  }

  return (req: Request, res: Response, next: NextFunction) => {
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