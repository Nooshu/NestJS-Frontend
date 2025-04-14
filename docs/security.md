# Security Configuration

This document outlines the security features implemented in the NestJS application.

## Overview

The application implements several security measures following OWASP best practices, including:

- Rate Limiting
- Security Headers
- CORS Configuration
- Content Security Policy
- Cross-Origin Policies

## Rate Limiting

The application implements rate limiting using `@nestjs/throttler`:

```typescript
throttler: {
  throttlers: [{
    ttl: 60,      // Time to live in seconds
    limit: 10,    // Maximum number of requests within TTL
  }],
}
```

This configuration:
- Limits requests to 10 per minute per IP address
- Helps prevent brute force and DoS attacks
- Can be adjusted in `src/shared/config/security.config.ts`

## Security Headers

The application uses Helmet.js to set various security headers:

### Content Security Policy (CSP)
```typescript
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
}
```

### Cross-Origin Policies
```typescript
crossOriginEmbedderPolicy: { policy: 'require-corp' },
crossOriginOpenerPolicy: { policy: 'same-origin' },
crossOriginResourcePolicy: { policy: 'same-origin' },
```

### Other Security Headers
- `dnsPrefetchControl`: Prevents DNS prefetching
- `frameguard`: Prevents clickjacking
- `hidePoweredBy`: Removes X-Powered-By header
- `hsts`: Enforces HTTPS
- `ieNoOpen`: Prevents automatic downloads in IE
- `noSniff`: Prevents MIME type sniffing
- `originAgentCluster`: Improves origin isolation
- `permittedCrossDomainPolicies`: Controls cross-domain access
- `referrerPolicy`: Controls referrer information
- `xssFilter`: Enables XSS protection
- `expectCt`: Enforces Certificate Transparency

## CORS Configuration

The application implements CORS with the following settings:

```typescript
cors: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600,
}
```

## Configuration

All security settings can be adjusted in `src/shared/config/security.config.ts`. The configuration is loaded in:

1. `src/shared/security/security.module.ts` - For rate limiting
2. `src/main.ts` - For Helmet and CORS configuration

## Best Practices

1. **Environment Variables**
   - Use environment variables for sensitive configurations
   - Example: `CORS_ORIGIN` for CORS configuration

2. **Content Security Policy**
   - Review and adjust CSP directives based on application needs
   - Consider using nonces or hashes instead of 'unsafe-inline'

3. **Rate Limiting**
   - Adjust rate limits based on application requirements
   - Consider implementing different limits for different endpoints

4. **CORS**
   - Set appropriate origins in production
   - Review allowed methods and headers
   - Consider using a whitelist for origins

## Troubleshooting

If you encounter issues with the security configuration:

1. **CSP Violations**
   - Check browser console for CSP violation reports
   - Adjust CSP directives as needed

2. **CORS Issues**
   - Verify CORS origin configuration
   - Check allowed methods and headers

3. **Rate Limiting**
   - Adjust TTL and limit values if needed
   - Consider implementing different limits for different routes

## References

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NestJS Security](https://docs.nestjs.com/security)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 