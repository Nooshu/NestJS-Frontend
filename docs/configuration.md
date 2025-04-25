# Configuration Guide

This document outlines the configuration options available in the application and how to use them.

## Overview

The application uses a centralized configuration system that supports:
- Environment-based configuration
- Type-safe configuration access
- Configuration validation
- Default values
- Documentation

## Configuration Structure

The configuration is organized into several sections:

### 1. Application
- `PORT`: Application port number (default: 3000)
- `NODE_ENV`: Application environment (development, production, test)

### 2. Views
- `VIEWS_DIRECTORY`: Directory containing view templates
- `VIEWS_CACHE`: Whether to cache compiled templates

### 3. Public Assets
- `PUBLIC_DIRECTORY`: Directory containing public assets

### 4. Security
#### CORS
- `CORS_ENABLED`: Whether CORS is enabled
- `CORS_ORIGIN`: Allowed CORS origins

#### CSRF
- `CSRF_ENABLED`: Whether CSRF protection is enabled
- `CSRF_COOKIE_NAME`: CSRF cookie name
- `CSRF_HEADER_NAME`: CSRF header name
- `CSRF_COOKIE_HTTP_ONLY`: Whether cookie is HTTP only
- `CSRF_COOKIE_SECURE`: Whether cookie is secure
- `CSRF_COOKIE_SAME_SITE`: Cookie same site policy

#### Content Security Policy
- `CSP_ENABLED`: Whether CSP is enabled
- CSP directives are configured in the application code

### 5. Database
- `DB_TYPE`: Database type (postgres, mysql, sqlite)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_SYNCHRONIZE`: Whether to synchronize database schema
- `DB_LOGGING`: Whether to log database queries

### 6. Redis
- `REDIS_ENABLED`: Whether Redis is enabled
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password
- `REDIS_DB`: Redis database number

### 7. Logging
- `LOG_LEVEL`: Log level (error, warn, info, debug)
- `LOG_CONSOLE`: Whether to log to console
- `LOG_FILE`: Whether to log to file
- `LOG_FILE_PATH`: Log file path

### 8. Performance Monitoring
- `PERFORMANCE_ENABLED`: Whether performance monitoring is enabled
- `PERFORMANCE_SAMPLING_RATE`: Performance sampling rate
- `PERFORMANCE_MAX_ENTRIES`: Maximum number of performance entries
- `PERFORMANCE_REPORT_ON_UNLOAD`: Whether to report on page unload

## Usage

### 1. Environment Variables

Set environment variables in your `.env` file:

```env
# Application
PORT=3000
NODE_ENV=development

# Security
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
CSRF_ENABLED=true
CSRF_COOKIE_NAME=XSRF-TOKEN
CSRF_HEADER_NAME=X-XSRF-TOKEN
CSRF_COOKIE_HTTP_ONLY=true
CSRF_COOKIE_SECURE=true
CSRF_COOKIE_SAME_SITE=strict
CSP_ENABLED=true

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_frontend
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_FILE=false
LOG_FILE_PATH=logs/app.log

# Performance
PERFORMANCE_ENABLED=true
PERFORMANCE_SAMPLING_RATE=1
PERFORMANCE_MAX_ENTRIES=100
PERFORMANCE_REPORT_ON_UNLOAD=true
```

### 2. Using Configuration in Code

Inject the `ConfigService` into your services:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';

@Injectable()
export class YourService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    // Access configuration values
    const port = this.configService.port;
    const environment = this.configService.environment;
    const security = this.configService.security;
    const database = this.configService.database;
  }
}
```

### 3. Configuration Validation

The application validates configuration values on startup. If any required values are missing or invalid, the application will fail to start with a descriptive error message.

## Best Practices

1. **Environment-Specific Configuration**
   - Use different `.env` files for different environments
   - Never commit sensitive values to version control
   - Use environment variables for sensitive data

2. **Default Values**
   - Always provide sensible default values
   - Document default values in configuration schema
   - Use type-safe configuration access

3. **Security**
   - Keep sensitive values in environment variables
   - Use secure defaults for security-related settings
   - Validate all configuration values

4. **Performance**
   - Cache configuration values where appropriate
   - Use type-safe access to avoid runtime errors
   - Validate configuration on startup

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check if `.env` file exists
   - Verify environment variable names
   - Check file permissions

2. **Validation Errors**
   - Review error messages
   - Check configuration schema
   - Verify environment variable types

3. **Type Errors**
   - Use type-safe configuration access
   - Check configuration service types
   - Verify environment variable types

## Additional Resources

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Environment Variables](https://12factor.net/config)
- [Configuration Best Practices](https://martinfowler.com/articles/configurationAsCode.html) 