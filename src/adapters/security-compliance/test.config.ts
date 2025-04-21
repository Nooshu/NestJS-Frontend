import { SecurityConfig } from './security.types';

export const mockSecurityConfig: Required<SecurityConfig> = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    headers: true,
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
  helmet: {
    contentSecurityPolicy: false,
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
  },
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  dataProtection: {
    masking: {
      enabled: true,
      fields: ['password', 'token'],
    },
  },
  audit: {
    enabled: true,
    exclude: ['password'],
  },
}; 