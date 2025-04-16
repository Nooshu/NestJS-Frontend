import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { HelmetOptions } from 'helmet';
import configuration from './configuration';

const isProd = process.env.NODE_ENV === 'production';

export const securityConfig = {
  throttler: [{
    ttl: 60000,
    limit: 10,
  }] as ThrottlerModuleOptions,

  helmet: {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        // Only allow resources from same origin by default
        defaultSrc: ["'self'"],
        
        // Scripts configuration
        scriptSrc: isProd 
          ? ["'self'"] 
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
        //reportUri: '/api/csp-report'
      },
      
      // Report violations instead of blocking if you want to monitor
      // reportUri: '/csp-violation-report'
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

  cors: {
    origin: configuration().corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
  },

  permissionsPolicy: {
    policy: {
      'geolocation': ['self'],
      'camera': ['none'],
      'microphone': ['none'],
      'payment': ['self'],
      'usb': ['none']
    }
  },

  trustedTypes: {
    policy: "'self'"
  },
}; 