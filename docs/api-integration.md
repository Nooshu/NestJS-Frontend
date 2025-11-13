# API Integration Guide

This document provides guidance on how to integrate the frontend application with backend APIs.

## Overview

The frontend application uses a standardised API client configuration for making HTTP requests to backend APIs. The configuration includes built-in error handling, timeout management, logging, and authentication support.

## Configuration

### Environment Variables

The following environment variables need to be configured in your `.env` file:

```env
API_BASE_URL=http://your-backend-url
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_CACHE_ENABLED=false
API_CACHE_TTL=300000
```

### API Configuration

The API configuration is defined in `src/shared/config/api.config.ts`:

```typescript
export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
  caching: {
    enabled: process.env.API_CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.API_CACHE_TTL || '300000', 10),
  },
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
  }
};
```

## API Client Usage

### Making Requests

The application uses NestJS's built-in HTTP module for making requests:

```typescript
// Example usage in a service
@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // GET request
  async getUsers(): Promise<User[]> {
    const { data } = await this.httpService.get<User[]>(
      `${this.configService.get('api.baseUrl')}/api/users`
    ).toPromise();
    return data;
  }

  // POST request
  async createUser(user: User): Promise<User> {
    const { data } = await this.httpService.post<User>(
      `${this.configService.get('api.baseUrl')}/api/users`,
      user
    ).toPromise();
    return data;
  }
}
```

### Error Handling

The application includes built-in error handling for API responses:

```typescript
try {
  const user = await userService.getUserById('123');
} catch (error) {
  if (error instanceof HttpException) {
    switch (error.getStatus()) {
      case 400:
        // Handle validation errors
        break;
      case 401:
        // Handle authentication errors
        break;
      case 403:
        // Handle authorization errors
        break;
      case 404:
        // Handle not found errors
        break;
      case 500:
        // Handle server errors
        break;
    }
  }
}
```

## Security

### Authentication

The application supports multiple authentication methods through the security configuration:

```typescript
// Security configuration in src/shared/config/security.config.ts
export const securityConfig = {
  // ... other security config
  cors: {
    origin: configuration().corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
  },
};
```

## Best Practices

1. **Error Handling**
   - Use the built-in error handling and filters
   - Implement proper error logging
   - Sanitize error messages in production

2. **Caching**
   - Utilize the built-in caching service
   - Configure appropriate TTL values
   - Consider data volatility when setting cache durations

3. **Performance**
   - Use the configured timeout settings
   - Implement retry logic for failed requests
   - Monitor API response times

4. **Security**
   - Always use HTTPS for API communication
   - Implement proper CORS policies
   - Follow government security guidelines

## API Documentation with Swagger

The application includes Swagger (OpenAPI) documentation for all API endpoints. The documentation is automatically generated from code annotations and is available when running the application.

### Accessing the Documentation

1. Start the application:
```bash
npm run start:dev
```

2. Visit the Swagger UI at: `http://localhost:3002/api-docs`

### Documentation Features

- Interactive API exploration
- Detailed endpoint descriptions
- Request/response schema documentation
- Try-it-out functionality for testing endpoints
- Authentication documentation
- Automatic schema generation from TypeScript types

For detailed information about Swagger documentation, see [Swagger Documentation Guide](./swagger-documentation.md). 
