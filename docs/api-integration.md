# API Integration Guide

This document provides guidance on how to integrate the frontend application with a Java backend API.

## Overview

The frontend application uses a specialized `JavaApiClient` for making HTTP requests to Java-based backend APIs. The client includes built-in error handling, timeout management, logging, and authentication support.

## Configuration

### Environment Variables

The following environment variables need to be configured in your `.env` file:

```env
JAVA_API_BASE_URL=http://your-java-backend-url
JAVA_API_TIMEOUT=30000
JAVA_API_RETRY_ATTEMPTS=3
JAVA_API_RETRY_DELAY=1000
```

### Authentication Configuration

The Java API client supports multiple authentication methods:

```typescript
// Basic Authentication
const basicAuthConfig: JavaApiClientConfig = {
  baseUrl: 'https://api.example.gov.uk',
  auth: {
    type: 'basic',
    credentials: {
      username: 'your-username',
      password: 'your-password'
    }
  }
};

// Bearer Token Authentication
const bearerAuthConfig: JavaApiClientConfig = {
  baseUrl: 'https://api.example.gov.uk',
  auth: {
    type: 'bearer',
    credentials: {
      token: 'your-token'
    }
  }
};

// OAuth2 Authentication
const oauth2Config: JavaApiClientConfig = {
  baseUrl: 'https://api.example.gov.uk',
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret'
    }
  }
};
```

## API Client Usage

### Making Requests

The `JavaApiClient` provides methods for making HTTP requests:

```typescript
// Example usage in a service
export class UserService {
  private apiClient: JavaApiClient;

  constructor(config: JavaApiClientConfig, logger: Logger) {
    this.apiClient = new JavaApiClient(config, logger);
  }

  // GET request
  async getUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>('/api/users');
  }

  // POST request
  async createUser(user: User): Promise<User> {
    return this.apiClient.post<User>('/api/users', user);
  }

  // PUT request
  async updateUser(id: string, user: User): Promise<User> {
    return this.apiClient.put<User>(`/api/users/${id}`, user);
  }

  // DELETE request
  async deleteUser(id: string): Promise<void> {
    return this.apiClient.delete(`/api/users/${id}`);
  }
}
```

### Error Handling

The client includes built-in error handling for API responses:

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

The Java API client supports multiple authentication methods:
- Basic Authentication
- Bearer Token Authentication
- OAuth2 Authentication

### Rate Limiting

The client implements rate limiting with the following settings:
- Window: 15 minutes
- Maximum requests: 100 per IP address

## Best Practices

1. **Error Handling**
   - Always handle API errors using the built-in error handling
   - Use the provided error interceptor for consistent error responses
   - Log errors appropriately using the provided logger

2. **Caching**
   - Utilise the built-in caching service for frequently accessed data
   - Cache durations are configurable based on data volatility

3. **Performance**
   - The API client includes connection pooling and keep-alive settings
   - Automatic retry logic for failed requests
   - Configurable timeouts and retry attempts

4. **Security**
   - Always use HTTPS for API communication
   - Implement proper CORS policies on the Java backend
   - Use secure authentication methods
   - Follow government security guidelines

## Example Integration

Here's a complete example of integrating with a Java backend:

```typescript
// user.service.ts
export class UserService {
  private apiClient: JavaApiClient;

  constructor(config: JavaApiClientConfig, logger: Logger) {
    this.apiClient = new JavaApiClient(config, logger);
  }

  async getUsers(page: number = 1): Promise<PaginatedResponse<User[]>> {
    return this.apiClient.get<PaginatedResponse<User[]>>(
      `/api/users?page=${page}`
    );
  }

  async createUser(user: User): Promise<User> {
    return this.apiClient.post<User>('/api/users', user);
  }
}
```

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**
   - Check that authentication credentials are correctly configured
   - Verify the authentication type matches the backend requirements
   - Ensure tokens are valid and not expired

2. **Timeout Issues**
   - The default timeout is 30 seconds
   - Adjust the timeout in the configuration if needed
   - Check network connectivity and backend response times

3. **Rate Limiting**
   - Monitor the rate limit headers from the backend
   - Implement exponential backoff for retries
   - Consider implementing request queuing for high-volume scenarios

4. **Error Handling**
   - Check the error response format
   - Verify error handling implementation
   - Review logs for detailed error information

## API Documentation with Swagger

Our API is documented using Swagger (OpenAPI), providing an interactive interface for exploring and testing endpoints.

### Using the Swagger UI

1. Access the documentation at `/api-docs`
2. Browse available endpoints grouped by tags
3. Try out endpoints directly from the UI
4. View request/response schemas and examples

### Integration Testing with Swagger

The Swagger UI can be used for integration testing:

1. Navigate to the desired endpoint
2. Click "Try it out"
3. Fill in required parameters
4. Execute the request
5. View the response and status code

For detailed information about Swagger documentation, see [Swagger Documentation Guide](./swagger-documentation.md). 
