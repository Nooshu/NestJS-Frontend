# Security Configuration

This document outlines the security features implemented in the NestJS application.

## Overview

The application implements comprehensive security measures following OWASP best practices and government security standards, including:

- Rate Limiting
- Security Headers
- CORS Configuration
- Content Security Policy
- Cross-Origin Policies
- Session Security
- Audit Logging
- Data Protection

## Security Configuration

The main security configuration is defined in `src/shared/config/security.config.ts`:

```typescript
export const securityConfig = {
  throttler: [{
    ttl: 60000,
    limit: 10,
  }],

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
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      }
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
  },

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
  }
};
```

## Session Security

The application implements secure session management:

```typescript
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
}
```

## Audit Logging

The application includes comprehensive audit logging:

```typescript
audit: {
  enabled: true,
  level: 'info',
  format: 'json',
  include: [
    'timestamp',
    'user',
    'action',
    'resource',
    'status',
    'ip',
    'userAgent',
  ],
}
```

## Data Protection

The application implements data protection measures:

```typescript
dataProtection: {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyRotationDays: 90,
  },
  masking: {
    enabled: true,
    fields: ['password', 'token', 'secret'],
  },
}
```

## Best Practices

1. **Environment Variables**
   - Use environment variables for sensitive configurations
   - Store secrets in secure vaults
   - Rotate secrets regularly

2. **Content Security Policy**
   - Review and adjust CSP directives based on application needs
   - Use nonces or hashes instead of 'unsafe-inline' where possible
   - Regularly audit CSP violations

3. **Rate Limiting**
   - Adjust rate limits based on application requirements
   - Implement different limits for different endpoints
   - Monitor for abuse patterns

4. **CORS**
   - Set appropriate origins in production
   - Review allowed methods and headers
   - Use a whitelist for origins

5. **Session Management**
   - Use secure session configuration
   - Implement proper session timeouts
   - Handle session revocation

6. **Audit Logging**
   - Log all security-relevant events
   - Maintain audit trails
   - Protect audit logs from tampering

7. **Data Protection**
   - Encrypt sensitive data
   - Implement proper key rotation
   - Mask sensitive fields in logs

## Error Handling Security

The application implements secure error handling through the `SecurityErrorFilter`:

```typescript
// Production vs Development error responses
{
  production: {
    status: httpStatus,
    message: 'Internal server error',
    stack: undefined
  },
  development: {
    status: httpStatus,
    message: actualErrorMessage,
    stack: errorStack
  }
}
```

## References

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NestJS Security](https://docs.nestjs.com/security)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Government Security Standards](https://www.gov.uk/government/publications/security-policy-framework) 
