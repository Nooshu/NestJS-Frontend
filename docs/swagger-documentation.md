# Swagger Documentation Guide

## Overview

This application uses Swagger (OpenAPI) for API documentation. This guide explains how to maintain and extend the API documentation.

## Setup

The Swagger documentation is configured in `src/main.ts` using `@nestjs/swagger`. The configuration includes:

- Document title and description
- API version
- Additional configurations (auth, tags, servers)

## Documentation Standards

### Controller Documentation

Controllers should be documented using the following decorators:

```typescript
@ApiTags('category')          // Group endpoints
@Controller('path')
export class YourController {
  @ApiOperation({            // Describe the operation
    summary: 'Short description',
    description: 'Detailed description'
  })
  @ApiResponse({            // Document responses
    status: 200,
    description: 'Success response description',
    type: ResponseDTO
  })
  @ApiResponse({
    status: 400,
    description: 'Error response description'
  })
  @Get()
  yourMethod() {}
}
```

### DTO Documentation

Data Transfer Objects (DTOs) should be documented using `@ApiProperty`:

```typescript
export class YourDTO {
  @ApiProperty({
    description: 'Property description',
    example: 'Example value',
    required: true
  })
  property: string;
}
```

### Authentication Documentation

If your API uses authentication:

1. Configure auth in SwaggerModule setup:
```typescript
.addBearerAuth()  // For JWT
.addBasicAuth()   // For Basic auth
```

2. Add auth decorators to protected endpoints:
```typescript
@ApiBearerAuth()
@UseGuards(AuthGuard)
```

## Best Practices

1. **Consistency**: Use consistent naming and descriptions across similar endpoints
2. **Examples**: Provide meaningful examples for request/response bodies
3. **Grouping**: Use logical tags to group related endpoints
4. **Descriptions**: Write clear, concise descriptions
5. **Response Types**: Always specify response types and possible status codes

## Maintenance

### Regular Updates

1. Review documentation when adding new endpoints
2. Update examples to reflect current API Behaviour
3. Remove documentation for deprecated endpoints
4. Keep authentication documentation current

### Testing Documentation

1. Regularly visit the Swagger UI (`/api-docs`)
2. Test the "Try it out" functionality
3. Verify all examples are valid
4. Check that response types match actual responses

## Troubleshooting

Common issues and solutions:

1. **Missing Documentation**
   - Verify decorators are properly imported
   - Check that all necessary decorators are applied

2. **Incorrect Schema**
   - Verify DTO properties are properly decorated
   - Check that types are correctly specified

3. **Authentication Issues**
   - Verify auth configuration in SwaggerModule setup
   - Check that auth decorators are properly applied

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/) 