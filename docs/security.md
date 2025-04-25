# Security Features

This document outlines the security features and best practices implemented in the application.

## Overview

The application implements comprehensive security measures to protect against common web vulnerabilities and ensure secure data handling. These measures include CSRF protection, Content Security Policy, and other security headers.

## CSRF Protection

### Implementation
The application uses the `csurf` middleware to protect against Cross-Site Request Forgery attacks. The implementation includes:

- Secure cookie settings
- Token validation
- Proper error handling
- API route exclusions
- Automatic token generation

### Configuration
```typescript
// CSRF middleware configuration
{
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    key: '_csrf',
    path: '/',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
}
```

### Usage
To use CSRF protection in forms:

```html
<form method="POST" action="/submit">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}">
  <!-- form fields -->
</form>
```

## Content Security Policy (CSP)

### Implementation
The application implements a comprehensive Content Security Policy using Helmet.js. The policy includes:

- Strict default source restrictions
- Nonce-based script security
- Inline style allowances for GOV.UK Frontend
- Resource restrictions
- Violation reporting

### Configuration
```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: isProd 
      ? ["'self'", "'nonce-${nonce}'"] 
      : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],
    connectSrc: ["'self'", 'https://api.your-service.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    upgradeInsecureRequests: [],
    manifestSrc: ["'self'"],
    workerSrc: ["'self'"],
    reportUri: '/api/csp-report'
  },
  reportOnly: !isProd,
}
```

### Violation Reporting
The application includes a CSP violation reporting endpoint that:

- Logs violations
- Stores violation data
- Provides monitoring capabilities
- Supports development mode

## Security Headers

### HTTP Headers
The application sets various security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Content-Security-Policy: (as configured above)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: (as configured below)

### Permissions Policy
The application implements a strict permissions policy:

```typescript
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
}
```

## CORS Configuration

### Implementation
The application implements Cross-Origin Resource Sharing (CORS) with:

- Configurable origins
- Method restrictions
- Header controls
- Credential handling
- Cache control

### Configuration
```typescript
cors: {
  origin: configuration().corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600,
}
```

## Best Practices

### Security Guidelines
Follow these guidelines for optimal security:

1. Always use CSRF tokens in forms
2. Keep security headers up to date
3. Monitor CSP violations
4. Regularly update dependencies
5. Use secure cookie settings
6. Implement proper error handling
7. Follow the principle of least privilege
8. Use HTTPS in production
9. Implement proper logging
10. Regular security audits

### Development Workflow
Security considerations for development:

1. Use development-specific security settings
2. Monitor security headers in development
3. Test security features regularly
4. Keep security documentation updated
5. Follow security best practices

## Troubleshooting

### Common Issues
Solutions for common security issues:

1. CSRF token validation failures
   - Check cookie settings
   - Verify token generation
   - Check form implementation
   - Review middleware configuration

2. CSP violations
   - Check resource origins
   - Verify nonce implementation
   - Review inline script usage
   - Check style restrictions

3. CORS issues
   - Verify origin configuration
   - Check method allowances
   - Review header settings
   - Test credential handling

4. Security header problems
   - Check header configuration
   - Verify header values
   - Review browser compatibility
   - Test header effectiveness

## Additional Resources

### Documentation
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSRF Protection Guide](https://owasp.org/www-community/attacks/csrf)

### Tools
- [Security Headers](https://securityheaders.com)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp) 
