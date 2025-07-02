# Security Middleware Enhancements

## Overview

This document outlines the comprehensive security enhancements made to the NestJS frontend application. The enhancements include advanced rate limiting, request sanitization, security audit logging, enhanced security headers, and improved CSRF protection.

## Enhanced Security Features

### 1. Advanced Rate Limiting Middleware (`RateLimitingMiddleware`)

**Location**: `src/shared/middleware/rate-limiting.middleware.ts`

**Features**:
- **Path-specific rate limits**: Different limits for authentication, API, and general routes
- **Intelligent client identification**: Uses IP address and user agent fingerprinting
- **Progressive blocking**: Temporary blocks with exponential backoff
- **Memory cleanup**: Automatic cleanup of expired entries
- **Comprehensive logging**: Detailed logging of rate limit violations

**Configuration**:
```typescript
'/api/auth': {
  windowMs: 15 * 60 * 1000,     // 15 minutes
  maxRequests: 5,               // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
}
'/api': {
  windowMs: 60 * 1000,          // 1 minute
  maxRequests: 100,             // 100 requests per minute
  blockDurationMs: 5 * 60 * 1000,  // 5 minutes block
}
```

**Headers Set**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when blocked)

### 2. Request Sanitization Middleware (`RequestSanitizationMiddleware`)

**Location**: `src/shared/middleware/request-sanitization.middleware.ts`

**Features**:
- **Input validation**: Validates request size, URL length, and header size
- **Pattern detection**: Detects SQL injection, XSS, and path traversal attempts
- **Content sanitization**: Sanitizes request body and query parameters
- **Suspicious activity detection**: Identifies and logs suspicious patterns
- **Configurable limits**: Customizable size and pattern restrictions

**Security Patterns Detected**:
- SQL Injection: `union`, `select`, `insert`, `update`, `delete`, `drop`
- XSS: `<script>`, `<iframe>`, `javascript:`, `vbscript:`
- Path Traversal: `../`, `..\`
- Command Injection: `;`, `&`, `|`, `` ` ``, `$`, `()`, `{}`

**Configuration**:
```typescript
maxBodySize: 10 * 1024 * 1024,    // 10MB
maxUrlLength: 2048,                // 2KB
maxHeaderSize: 8192,               // 8KB
allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
```

### 3. Security Audit Middleware (`SecurityAuditMiddleware`)

**Location**: `src/shared/middleware/security-audit.middleware.ts`

**Features**:
- **Comprehensive logging**: Logs authentication, authorization, and suspicious activities
- **Event classification**: Categorizes events by type and severity
- **Data sanitization**: Removes sensitive information from logs
- **Response monitoring**: Tracks response codes and timing
- **Threat detection**: Identifies suspicious user agents and request patterns

**Event Types**:
- `authentication`: Login/logout attempts
- `authorization`: Access control violations
- `suspicious_activity`: Detected threats
- `rate_limit`: Rate limiting violations
- `validation_error`: Input validation failures
- `access_denied`: Forbidden access attempts

**Severity Levels**:
- `critical`: Immediate attention required
- `high`: Important security events
- `medium`: Notable security events
- `low`: Informational security events

### 4. Enhanced Security Headers Middleware (`SecurityHeadersMiddleware`)

**Location**: `src/shared/middleware/security-headers.middleware.ts`

**Features**:
- **Comprehensive security headers**: 20+ security headers applied
- **Route-specific policies**: Different policies for API, static, and HTML routes
- **CSP integration**: Dynamic Content Security Policy generation
- **HSTS enforcement**: HTTP Strict Transport Security for HTTPS
- **Privacy protection**: Enhanced referrer and permissions policies

**Headers Applied**:
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), ...
```

### 5. Enhanced Security Module (`EnhancedSecurityModule`)

**Location**: `src/shared/security/enhanced-security.module.ts`

**Features**:
- **Centralized security**: Single module for all security middleware
- **Ordered middleware**: Proper middleware execution order
- **Dependency injection**: Proper service injection and configuration
- **Modular design**: Easy to enable/disable specific security features

**Middleware Order**:
1. Request Sanitization (first line of defense)
2. Rate Limiting (prevent abuse)
3. Security Headers (set security policies)
4. CSP Middleware (content security policy)
5. CSRF Protection (form submissions)
6. Security Audit Logging (monitoring)

## Security Configuration

### Environment Variables

```bash
# Security Configuration
SECURITY_CORS_ENABLED=false
SECURITY_CORS_ORIGIN=*
SECURITY_CSRF_ENABLED=true
SECURITY_CSP_ENABLED=true
COOKIE_SECRET=your-secure-cookie-secret
```

### Configuration Schema

The security configuration is validated using Joi schema:

```typescript
security: Joi.object({
  cors: Joi.object({
    enabled: Joi.boolean().default(false),
    origin: Joi.string().default('*'),
  }),
  csrf: Joi.object({
    enabled: Joi.boolean().default(true),
    cookieName: Joi.string().default('XSRF-TOKEN'),
  }),
  csp: Joi.object({
    enabled: Joi.boolean().default(true),
    directives: Joi.object().default({
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }),
  }),
})
```

## Integration Guide

### 1. Update Main Application Module

```typescript
import { EnhancedSecurityModule } from './shared/security/enhanced-security.module';

@Module({
  imports: [
    // ... other modules
    EnhancedSecurityModule,
  ],
})
export class AppModule {}
```

### 2. Update Main.ts

```typescript
import { SecurityErrorFilter } from './shared/filters/security-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global security filter
  app.useGlobalFilters(new SecurityErrorFilter());
  
  await app.listen(3000);
}
```

### 3. Environment Configuration

Update your `.env` file with security configurations:

```bash
# Add security-specific environment variables
SECURITY_CORS_ENABLED=false
SECURITY_CSRF_ENABLED=true
SECURITY_CSP_ENABLED=true
COOKIE_SECRET=generate-a-secure-random-string
```

## Testing

### Running Security Tests

```bash
# Run all security middleware tests
npm test -- --testPathPattern=middleware

# Run specific middleware tests
npm test -- rate-limiting.middleware.spec.ts
npm test -- request-sanitization.middleware.spec.ts
npm test -- security-audit.middleware.spec.ts
```

### Test Coverage

The security middleware includes comprehensive test coverage:

- **Rate Limiting**: Tests for different rate limits, client identification, and cleanup
- **Request Sanitization**: Tests for pattern detection, input validation, and sanitization
- **Security Audit**: Tests for event logging, threat detection, and data sanitization
- **Security Headers**: Tests for header application and route-specific policies

## Monitoring and Alerting

### Log Analysis

Security events are logged with structured data for easy analysis:

```json
{
  "level": "warn",
  "message": "Security Event: suspicious_activity",
  "timestamp": "2025-02-07T13:00:00.000Z",
  "securityEvent": {
    "type": "suspicious_activity",
    "severity": "medium",
    "clientInfo": {
      "ip": "192.168.1.100",
      "userAgent": "sqlmap/1.0"
    },
    "details": {
      "reasons": ["Suspicious user agent: sqlmap/1.0"]
    }
  }
}
```

### Recommended Monitoring

1. **Rate Limit Violations**: Monitor for excessive rate limiting
2. **Suspicious Patterns**: Alert on SQL injection or XSS attempts
3. **Authentication Failures**: Track failed login attempts
4. **Unusual Traffic**: Monitor for traffic spikes or unusual patterns

## Performance Considerations

### Memory Usage

- **Rate Limiting**: Uses in-memory storage with automatic cleanup
- **Request Sanitization**: Minimal memory overhead for pattern matching
- **Security Audit**: Structured logging with data sanitization

### Performance Impact

- **Minimal Latency**: ~1-2ms additional latency per request
- **Efficient Pattern Matching**: Optimized regex patterns
- **Asynchronous Logging**: Non-blocking security event logging

## Security Best Practices

### 1. Regular Updates

- Keep security patterns updated
- Review and update rate limits based on usage
- Monitor security logs regularly

### 2. Configuration Management

- Use environment-specific configurations
- Regularly rotate secrets and tokens
- Implement proper secret management

### 3. Incident Response

- Set up alerting for critical security events
- Have incident response procedures in place
- Regular security audits and penetration testing

## Troubleshooting

### Common Issues

1. **Rate Limiting Too Aggressive**
   - Adjust rate limits in middleware configuration
   - Check client identification logic

2. **False Positive Pattern Detection**
   - Review and refine security patterns
   - Add whitelisting for legitimate patterns

3. **Performance Issues**
   - Monitor middleware execution time
   - Optimize pattern matching if needed

### Debug Mode

Enable debug logging to troubleshoot security middleware:

```bash
DEBUG=security:* npm start
```

## Future Enhancements

### Planned Features

1. **Distributed Rate Limiting**: Redis-based rate limiting for multi-instance deployments
2. **Machine Learning**: AI-based threat detection
3. **Integration**: SIEM and security tool integrations
4. **Advanced Analytics**: Security dashboard and reporting

### Extensibility

The security middleware is designed to be extensible:

- Add custom security patterns
- Implement custom rate limiting strategies
- Extend audit logging with custom events
- Add integration with external security services

## Conclusion

The enhanced security middleware provides comprehensive protection against common web application threats while maintaining performance and usability. The modular design allows for easy customization and extension based on specific security requirements.

For questions or issues, please refer to the test files for usage examples or create an issue in the project repository.
