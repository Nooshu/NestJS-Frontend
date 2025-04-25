/**
 * Security configuration for the application.
 * Provides comprehensive security settings including CSP, CORS, and other security headers.
 * 
 * @module SecurityConfig
 * @description Application security configuration
 * 
 * @example
 * // Import and use security configuration
 * import { securityConfig } from './security.config';
 * 
 * // Apply security middleware
 * app.use(helmet(securityConfig.helmet));
 */

import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { HelmetOptions } from 'helmet';
import configuration from './configuration';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Main security configuration object
 * 
 * @type {Object}
 * @property {ThrottlerModuleOptions[]} throttler - Rate limiting configuration
 * @property {HelmetOptions} helmet - Helmet security headers configuration
 * @property {Object} cors - CORS configuration
 * @property {Object} permissionsPolicy - Permissions policy configuration
 * @property {Object} trustedTypes - Trusted Types policy configuration
 */
export const securityConfig = {
  /**
   * Rate limiting configuration
   * @type {ThrottlerModuleOptions[]}
   */
  throttler: [{
    ttl: 60000,
    limit: 10,
  }] as ThrottlerModuleOptions,

  /**
   * Helmet security headers configuration
   * @type {HelmetOptions}
   */
  helmet: {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        // Only allow resources from same origin by default
        defaultSrc: ["'self'"],
        
        // Scripts configuration
        scriptSrc: isProd 
          ? ["'self'", "'nonce-${nonce}'"] 
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        
        // Styles configuration
        styleSrc: [
          "'self'",
          // Allow inline styles for GOV.UK Frontend
          "'unsafe-inline'"
        ],
        
        // Images configuration
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          // Add any specific image domains you need
        ],
        
        // Font configuration
        fontSrc: [
          "'self'",
          'data:',
          // Add any external font domains if needed
        ],
        
        // Connect configuration (for APIs, websockets)
        connectSrc: [
          "'self'",
          'https://api.your-service.com',
          'wss://websocket.your-service.com'
        ],
        
        // Disable object sources (Flash, etc)
        objectSrc: ["'none'"],
        
        // Media source configuration
        mediaSrc: ["'self'"],
        
        // Frame configuration
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        
        // Form submission configuration
        formAction: ["'self'"],
        
        // Base URI configuration
        baseUri: ["'self'"],
        
        // Force HTTPS
        upgradeInsecureRequests: [],
        
        // Add manifest sources if you have a web manifest
        manifestSrc: ["'self'"],
        
        // Worker configuration if you use web workers
        workerSrc: ["'self'"],
        
        // CSP violation reporting
        reportUri: '/api/csp-report'
      },
      
      // Report violations instead of blocking if you want to monitor
      reportOnly: !isProd,
    },
    
    // Cross-Origin Policies
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    
    // Frame Options
    frameguard: { action: 'deny' },
    
    // Hide Powered-By
    hidePoweredBy: true,
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    
    // IE No Open
    ieNoOpen: true,
    
    // No Sniff
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // XSS Filter
    xssFilter: true,
    
    // Additional OWASP Recommended Headers
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
  } as HelmetOptions,

  /**
   * CORS configuration
   * @type {Object}
   */
  cors: {
    origin: configuration().corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
  },

  /**
   * Permissions Policy configuration
   * @type {Object}
   */
  permissionsPolicy: {
    policy: {
      'geolocation': ['self'],
      'camera': ['none'],
      'microphone': ['none'],
      'payment': ['self'],
      'accelerometer': ['none'],
      'ambient-light-sensor': ['none'],
      'autoplay': ['none'],
      'battery': ['none'],
      'bluetooth': ['none'],
      'clipboard-read': ['none'],
      'clipboard-write': ['none'],
      'display-capture': ['none'],
      'document-domain': ['none'],
      'encrypted-media': ['none'],
      'execution-while-not-rendered': ['none'],
      'execution-while-out-of-viewport': ['none'],
      'fullscreen': ['none'],
      'gamepad': ['none'],
      'gyroscope': ['none'],
      'hid': ['none'],
      'idle-detection': ['none'],
      'magnetometer': ['none'],
      'midi': ['none'],
      'navigation-override': ['none'],
      'picture-in-picture': ['none'],
      'publickey-credentials-get': ['none'],
      'screen-wake-lock': ['none'],
      'serial': ['none'],
      'speaker-selection': ['none'],
      'sync-xhr': ['none'],
      'trust-token-redemption': ['none'],
      'unload': ['none'],
      'usb': ['none'],
      'web-share': ['none'],
      'xr-spatial-tracking': ['none']
    }
  },

  /**
   * Trusted Types policy configuration
   * @type {Object}
   */
  trustedTypes: {
    policy: "'self'"
  },
};

/**
 * API-specific security configuration
 * 
 * @type {Object}
 * @property {Object} headers - API request headers
 * @property {Object} rateLimit - API rate limiting configuration
 * @property {Object} cors - API CORS configuration
 */
export const apiSecurityConfig = {
  /**
   * API request headers
   * @type {Object}
   */
  headers: {
    'X-API-Key': process.env.API_KEY,
    'X-Client-ID': process.env.CLIENT_ID,
  },

  /**
   * API rate limiting configuration
   * @type {Object}
   */
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  /**
   * API CORS configuration
   * @type {Object}
   */
  cors: {
    origin: process.env.API_ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Client-ID'],
    credentials: true
  }
};