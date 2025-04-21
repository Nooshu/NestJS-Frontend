import { Request, Response, NextFunction, RequestHandler, Application } from 'express';
import { SecurityConfig, RequestWithUser } from './security.types';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { CacheConfig, CacheKey } from './cache.types';
import { CacheService as CacheServiceImpl } from './cache.service';
import { SecurityError, SecurityErrorCode } from './error.types';
import { securityErrorHandler } from './error.handler';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

/**
 * Applies government security standards to the Express application
 */
export function applyGovernmentSecurity(app: Application, config: Required<SecurityConfig>): void {
  // Apply security headers
  app.use(helmet(config.helmet));

  // Configure CORS
  app.use(cors(config.cors));

  // Apply rate limiting
  app.use(rateLimit(config.rateLimit));

  // Apply custom security headers
  if (config.headers) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      Object.entries(config.headers).forEach(([key, value]) => {
        res.setHeader(key, String(value));
      });
      next();
    });
  }

  // Apply audit logging
  app.use(auditLogging(config));

  // Apply password policy validation
  app.use(validatePasswordPolicy(config));

  // Apply sensitive data protection
  app.use(protectSensitiveData(config));

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
    const masking = config.dataProtection.masking;
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
const validatePassword = (password: string, policy: Required<SecurityConfig>['passwordPolicy']): boolean => {
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

export const securityMiddleware = (config: SecurityConfig) => {
  const cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 300, // 5 minutes default TTL
    prefix: 'gov-security',
    store: 'memory'
  };

  const cache = new CacheServiceImpl(cacheConfig);

  const middleware: RequestHandler[] = [];

  // Rate limiting with cache
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

  // Password policy with cache
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

  // Security headers with cache
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

  // Audit logging with cache
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
          ...(config.audit?.exclude ? excludeFields(req.body as Record<string, unknown>, config.audit.exclude) : {})
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