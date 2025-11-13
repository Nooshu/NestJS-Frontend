# API Documentation

This application includes Swagger (OpenAPI) documentation for all API endpoints. The documentation is automatically generated from code annotations and is available when running the application.

## Accessing the Documentation

1. Start the application:
```bash
npm run start:dev
```

2. Visit the Swagger UI at: `http://localhost:3002/api-docs`

## Documentation Features

- Interactive API exploration
- Detailed endpoint descriptions
- Request/response schema documentation
- Try-it-out functionality for testing endpoints
- Authentication documentation (if configured)
- Automatic schema generation from TypeScript types
- Support for complex data structures and nested objects

## Swagger Configuration

The Swagger documentation is configured in `src/main.ts` with the following settings:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS Frontend API')
  .setDescription('API documentation for the NestJS Frontend application using GOV.UK Frontend')
  .setVersion('1.0')
  .build();
```

## Best Practices for API Documentation

1. **Controller Documentation**
   - Use `@ApiTags()` to group related endpoints
   - Add `@ApiOperation()` to describe endpoint functionality
   - Include `@ApiResponse()` to document possible responses
   - Document authentication requirements with `@ApiBearerAuth()` or `@ApiBasicAuth()`

2. **DTO Documentation**
   - Use `@ApiProperty()` to document all properties
   - Include examples and descriptions
   - Mark required fields
   - Document enums and custom types

3. **Response Documentation**
   - Document all possible response codes
   - Include example responses
   - Document error responses
   - Use consistent response formats

## Example Documentation

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieves the profile information for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: UserProfileDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorised - Authentication required'
  })
  @ApiBearerAuth()
  @Get('profile')
  getProfile() {
    // Implementation
  }
}

// DTO Example
export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;
}
```

## Security Documentation

The application supports documenting security requirements:

1. **API Key Authentication**
   ```typescript
   .addApiKey({
     type: 'apiKey',
     name: 'X-API-Key',
     in: 'header'
   })
   ```

2. **Bearer Token Authentication**
   ```typescript
   .addBearerAuth()
   ```

3. **Basic Authentication**
   ```typescript
   .addBasicAuth()
   ```

## Maintaining Documentation

1. **Regular Updates**
   - Update documentation when adding new endpoints
   - Keep examples current
   - Remove documentation for deprecated endpoints
   - Review documentation during code reviews

2. **Testing Documentation**
   - Use the Swagger UI to test endpoints
   - Verify all examples work correctly
   - Check response types match actual responses
   - Test authentication flows

3. **Common Issues**
   - Missing decorators
   - Incorrect response types
   - Outdated examples
   - Incomplete authentication documentation

For more detailed information about Swagger documentation, see the [Swagger Documentation Guide](../swagger-documentation.md). 