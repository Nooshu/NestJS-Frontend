import type { CorsOptions } from 'cors';
import type { Options as RateLimitOptions } from 'express-rate-limit';
import { MemoryStore } from 'express-rate-limit';
import type { HelmetOptions } from 'helmet';

/**
 * Environment-specific configuration types
 */
type Environment = 'development' | 'staging' | 'production';

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  environment: Environment;
  helmet: HelmetOptions;
  cors: CorsOptions;
  rateLimit: RateLimitOptions;
  session: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      sameSite: 'strict' | 'lax' | 'none';
      maxAge: number;
    };
  };
  audit: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    include: string[];
  };
  headers: Record<string, string>;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAgeDays: number;
    historySize: number;
  };
  dataProtection: {
    encryption: {
      algorithm: string;
      keyRotationDays: number;
    };
    masking: {
      enabled: boolean;
      fields: string[];
    };
  };
}

/**
 * Validates required environment variables
 * @throws Error if required environment variables are missing
 */
function validateEnvironment(): void {
  const requiredEnvVars = ['NODE_ENV', 'SESSION_SECRET', 'CORS_ORIGIN'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Gets the current environment
 * @returns The current environment
 */
function getEnvironment(): Environment {
  const env = process.env.NODE_ENV?.toLowerCase();
  if (env === 'production' || env === 'staging') {
    return env;
  }
  return 'development';
}

/**
 * Security configuration based on government standards
 * Implements security headers and policies required for government services
 */
export const governmentSecurityConfig: SecurityConfig = {
  environment: getEnvironment(),

  /**
   * Helmet security headers configuration
   * Based on government security requirements
   */
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  },

  /**
   * CORS configuration for government services
   */
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    limit: 100,
    statusCode: 429,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (_req, res) => {
      res.status(429).json({ message: 'Too many requests from this IP, please try again later' });
    },
    identifier: 'rate-limit',
    requestPropertyName: 'rateLimit',
    skip: () => false,
    requestWasSuccessful: (_req, res) => res.statusCode < 400,
    store: new MemoryStore(),
    validate: true,
    passOnStoreError: false,
    ipv6Subnet: 64, // IPv6 subnet mask for rate limiting
  },

  /**
   * Session security configuration
   */
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  /**
   * Audit logging configuration
   */
  audit: {
    enabled: true,
    level: 'info',
    format: 'json',
    include: ['timestamp', 'user', 'action', 'resource', 'status', 'ip', 'userAgent'],
  },

  /**
   * Security headers for government compliance
   */
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },

  /**
   * Password policy configuration
   */
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    historySize: 5,
  },

  /**
   * Data protection configuration
   */
  dataProtection: {
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90,
    },
    masking: {
      enabled: true,
      fields: ['password', 'token', 'secret'],
    },
  },
};

// Validate environment variables on startup
validateEnvironment();
