import type { GovukConfig } from '../govuk.config';
import type { LoggingConfig } from '../logging.config';
import type { SecurityConfig } from '../security.types';

/**
 * Mock security configuration for testing
 */
export const mockSecurityConfig: SecurityConfig = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
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
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
};

/**
 * Mock GOV.UK Frontend configuration for testing
 */
export const mockGovukConfig: GovukConfig = {
  base: {
    serviceName: 'Test Service',
    serviceUrl: '/',
    showPhaseBanner: true,
    phase: 'beta',
    feedbackLink: '/feedback',
  },
  header: {
    showNavigation: true,
    navigationItems: [
      {
        text: 'Home',
        href: '/',
        active: true,
      },
    ],
  },
  footer: {
    showFooter: true,
    navigationItems: [
      {
        text: 'Help',
        href: '/help',
      },
    ],
  },
  cookieBanner: {
    showCookieBanner: true,
    cookiePolicyUrl: '/cookies',
  },
};

/**
 * Mock logging configuration for testing
 */
export const mockLoggingConfig: LoggingConfig = {
  base: {
    appName: 'test-app',
    environment: 'test',
    level: 'info',
    prettyPrint: false,
  },
  audit: {
    enabled: true,
    include: ['timestamp', 'user', 'action'],
    exclude: ['password'],
    maskSensitiveData: true,
    sensitiveFields: ['password'],
  },
  monitoring: {
    enabled: true,
    metrics: {
      http: true,
      system: true,
      business: true,
    },
    alerting: {
      enabled: true,
      thresholds: {
        errorRate: 5,
        responseTime: 1000,
        memoryUsage: 80,
      },
    },
  },
};
