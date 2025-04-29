import type { SecurityConfig } from './security.types';

/**
 * Mock security configuration for testing purposes.
 * Provides a complete set of security settings with test-appropriate values.
 */
export const testConfig: SecurityConfig = {
  rateLimit: {
    enabled: true,
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  audit: {
    enabled: true,
    excludeFields: ['password', 'token'],
  },
  dataProtection: {
    enabled: true,
    encryptionKey: 'test-key-12345',
    masking: {
      enabled: true,
      fields: ['password', 'ssn', 'creditCard'],
    },
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};
