import { Application, Request, Response, NextFunction } from 'express';
import { SecurityConfig, RequestWithUser } from './security.types';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Applies government security standards to the Express application
 */
export function applyGovernmentSecurity(app: Application, config: SecurityConfig): void {
  // Apply security headers
  app.use(helmet(config.helmet));

  // Configure CORS
  app.use(cors(config.cors));

  // Apply rate limiting
  app.use(rateLimit(config.rateLimit));

  // Apply custom security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    Object.entries(config.headers).forEach(([key, value]) => {
      res.setHeader(key, String(value));
    });
    next();
  });

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
function validatePasswordPolicy(config: SecurityConfig) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.path === '/auth/register' && req.method === 'POST') {
      const { password } = req.body as { password?: string };
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      if (password.length < config.passwordPolicy.minLength) {
        return res.status(400).json({ error: 'Password too short' });
      }
      
      if (config.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain uppercase letter' });
      }
      
      if (config.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain lowercase letter' });
      }
      
      if (config.passwordPolicy.requireNumbers && !/\d/.test(password)) {
        return res.status(400).json({ error: 'Password must contain number' });
      }
      
      if (config.passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain special character' });
      }
    }
    next();
  };
}

/**
 * Data protection middleware
 */
function protectSensitiveData(config: SecurityConfig) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (config.dataProtection.masking.enabled) {
      const originalJson = res.json;
      res.json = function(data: unknown) {
        if (typeof data === 'object' && data !== null) {
          const maskedData = maskSensitiveFields(data as Record<string, unknown>, config.dataProtection.masking.fields);
          return originalJson.call(this, maskedData);
        }
        return originalJson.call(this, data);
      };
    }
    next();
  };
}

function maskSensitiveFields(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const maskedData = { ...data };
  
  for (const field of fields) {
    if (field in maskedData) {
      const value = String(maskedData[field]);
      maskedData[field] = '*'.repeat(value.length);
    }
  }
  
  return maskedData;
}

function auditLogging(config: SecurityConfig) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (config.audit.enabled) {
      const timestamp = new Date().toISOString();
      const userId = req.user?.id || 'anonymous';
      const action = `${req.method} ${req.path}`;
      
      console.log(`[${timestamp}] User ${userId} performed ${action}`);
    }
    next();
  };
} 