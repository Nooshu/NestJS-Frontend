# API Integration Guide

This document provides guidance on how to integrate the frontend application with a Java backend API.

## Overview

The frontend application uses a centralized `ApiService` for making HTTP requests to the backend. The service includes built-in error handling, timeout management, and response transformation.

## Configuration

### Environment Variables

The following environment variables need to be configured in your `.env` file:

```env
API_BASE_URL=http://your-java-backend-url
API_KEY=your-api-key
CLIENT_ID=your-client-id
```

### CORS Configuration

The application is configured to work with Java backends with the following CORS settings:

```typescript
cors: {
  origin: ['http://localhost:8080'], // Add your Java backend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Client-ID'],
  credentials: true
}
```

## API Service Usage

### Making Requests

The `ApiService` provides methods for making HTTP requests:

```typescript
// Example usage in a service
@Injectable()
export class YourService {
  constructor(private readonly apiService: ApiService) {}

  // GET request
  async getData(): Promise<YourDataType> {
    return this.apiService.get<YourDataType>('/api/endpoint');
  }

  // POST request
  async createData(data: YourDataType): Promise<YourDataType> {
    return this.apiService.post<YourDataType>('/api/endpoint', data);
  }
}
```

### Response Format

The Java backend should return responses in the following format:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}
```

For paginated responses:

```typescript
interface PaginatedResponse<T> extends ApiResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
```

## Error Handling

The application includes built-in error handling for API responses. The Java backend should return errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-04-17T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Security

### API Authentication

The application sends the following headers with each request:
- `X-API-Key`: API key for authentication
- `X-Client-ID`: Client identifier

### Rate Limiting

The application implements rate limiting with the following settings:
- Window: 15 minutes
- Maximum requests: 100 per IP address

## Best Practices

1. **Error Handling**
   - Always handle API errors using the built-in error handling
   - Use the provided error interceptor for consistent error responses

2. **Caching**
   - Utilize the built-in caching service for frequently accessed data
   - Cache durations are configurable based on data volatility

3. **Performance**
   - The API service includes connection pooling and keep-alive settings
   - Automatic retry logic for failed requests

4. **Security**
   - Always use HTTPS for API communication
   - Implement proper CORS policies on the Java backend
   - Use secure API key management

## Example Integration

Here's a complete example of integrating with a Java backend:

```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(private readonly apiService: ApiService) {}

  async getUsers(page: number = 1): Promise<PaginatedResponse<User[]>> {
    return this.apiService.get<PaginatedResponse<User[]>>(
      `/api/users?page=${page}`
    );
  }

  async createUser(user: User): Promise<ApiResponse<User>> {
    return this.apiService.post<ApiResponse<User>>('/api/users', user);
  }
}
```

## Troubleshooting

Common issues and solutions:

1. **CORS Errors**
   - Ensure the Java backend has the correct CORS configuration
   - Verify the allowed origins include your frontend domain

2. **Authentication Failures**
   - Check that API keys and client IDs are correctly configured
   - Verify the headers are being sent with requests

3. **Timeout Issues**
   - The default timeout is 30 seconds
   - Adjust the timeout in the API configuration if needed

4. **Rate Limiting**
   - Monitor the rate limit headers from the backend
   - Implement exponential backoff for retries 