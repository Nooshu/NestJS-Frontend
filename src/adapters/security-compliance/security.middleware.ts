import { Request, Response, NextFunction, Application } from 'express';
import { SecurityConfig, RequestWithUser } from './security.types';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';

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

export const securityMiddleware = (config: Required<SecurityConfig>): Middleware[] => {
  const middleware: Middleware[] = [];

  // Rate limiting
  if (config.rateLimit) {
    middleware.push(
      rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        headers: config.rateLimit.headers,
      })
    );
  }

  // CORS
  if (config.cors) {
    middleware.push(
      cors({
        origin: config.cors.origin,
        methods: config.cors.methods,
        allowedHeaders: config.cors.allowedHeaders,
      })
    );
  }

  // Helmet security headers
  if (config.helmet) {
    middleware.push(helmet(config.helmet));
  }

  // Custom headers
  if (config.headers) {
    middleware.push((req: Request, res: Response, next: NextFunction) => {
      Object.entries(config.headers).forEach(([key, value]) => {
        res.setHeader(key, String(value));
      });
      next();
    });
  }

  // Password policy validation
  const policy = config.passwordPolicy;
  middleware.push((req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.path === '/auth/register' && req.method === 'POST') {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      if (password.length < policy.minLength) {
        return res.status(400).json({ error: `Password must be at least ${policy.minLength} characters long` });
      }
      if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
      }
      if (policy.requireLowercase && !/[a-z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
      }
      if (policy.requireNumbers && !/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one number' });
      }
      if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one special character' });
      }
    }
    next();
  });

  // Data protection
  const masking = config.dataProtection.masking;
  if (masking.enabled && Array.isArray(masking.fields)) {
    const fields = [...masking.fields];
    middleware.push((req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      res.json = function (data) {
        data = maskSensitiveFields(data, fields);
        return originalJson.call(this, data);
      };
      next();
    });
  }

  // Audit logging
  const audit = config.audit;
  if (audit.enabled) {
    middleware.push((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        const auditData = {
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        };
        console.log('Audit:', auditData);
      });
      next();
    });
  }

  return middleware;
}; 