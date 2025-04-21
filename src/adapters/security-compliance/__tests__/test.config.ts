import { SecurityConfig } from '../security.types';
import { GovukConfig } from '../govuk.config';
import { LoggingConfig } from '../logging.config';

/**
 * Mock security configuration for testing
 */
export const mockSecurityConfig: Required<SecurityConfig> = {
  helmet: {
    contentSecurityPolicy: false,
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    headers: true,
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
  },
  audit: {
    enabled: true,
    exclude: ['password'],
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