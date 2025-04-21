# NestJS Frontend Application

A NestJS application with GOV.UK Frontend integration.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

### Available Scripts

#### Development
- `npm run start` - Start the application in standard mode
- `npm run start:dev` - Start development server with hot reload
  - Automatically compiles TypeScript on the fly
  - Watches for file changes and recompiles automatically
  - Provides hot reloading for faster development
- `npm run start:debug` - Start in debug mode with watch enabled
  - Enables Node.js debugging capabilities
  - Allows attaching debugger for step-through debugging
- `npm run start:prod` - Start production server
  - Runs the built application from dist/
  - Uses production optimisations

#### Building
- `npm run build` - Build the application
  - Compiles TypeScript to JavaScript
  - Generates production-ready code in dist/

#### Testing
- `npm run test` - Run all tests
  - Executes all test files using Jest
  - Shows test results and summary
- `npm run test:watch` - Run tests in watch mode
  - Continuously watches for changes
  - Re-runs tests when files are modified
- `npm run test:cov` - Run tests with coverage reporting
  - Generates detailed code coverage report
  - Shows percentage of code covered by tests
- `npm run test:debug` - Run tests in debug mode
  - Enables debugging capabilities for tests
  - Uses Node.js inspector for debugging
- `npm run test:e2e` - Run end-to-end tests
  - Executes tests from test/jest-e2e.json configuration
  - Tests the application as a whole, including API endpoints and integration points
  - Verifies complete user flows and system interactions
  - Ensures all components work together correctly
- `npm run test:govuk` - Run GOV.UK component tests
  - Tests specific to GOV.UK Frontend components
- `npm run test:govuk:watch` - Run GOV.UK tests in watch mode
  - Continuously watches for changes in GOV.UK component tests
- `npm run test:govuk:cov` - Run GOV.UK tests with coverage
  - Generates coverage report for GOV.UK component tests

#### Code Quality
- `npm run format` - Format code with Prettier
  - Formats all TypeScript files in src/ and test/
  - Ensures consistent code style
- `npm run lint` - Run ESLint
  - Lints all TypeScript files
  - Automatically fixes fixable issues
  - Checks code style and potential problems

## Project Structure

```
src/
├── modules/         # Feature modules
├── shared/          # Shared utilities and services
│   ├── config/     # Configuration files
│   ├── constants/  # Application constants
│   ├── decorators/ # Custom decorators
│   ├── guards/     # Authentication/Authorisation guards
│   ├── interfaces/ # TypeScript interfaces
│   ├── middleware/ # Custom middleware
│   ├── services/   # Shared services
│   └── utils/      # Utility functions
├── cache/          # Caching functionality
│   ├── cache.module.ts  # Cache module configuration
│   └── cache.service.ts # Cache service implementation
├── logger/         # Logging functionality
│   ├── logger.module.ts # Logger module configuration
│   └── logger.service.ts # Logger service implementation
├── views/          # Nunjucks templates
└── public/         # Static assets
```

## API Documentation

This application includes Swagger (OpenAPI) documentation for all API endpoints. The documentation is automatically generated from code annotations and is available when running the application.

### Accessing the Documentation

1. Start the application:
```bash
npm run start:dev
```

2. Visit the Swagger UI at: `http://localhost:3000/api-docs`

### Documentation Features

- Interactive API exploration
- Detailed endpoint descriptions
- Request/response schema documentation
- Try-it-out functionality for testing endpoints
- Authentication documentation (if configured)
- Automatic schema generation from TypeScript types
- Support for complex data structures and nested objects

### Swagger Configuration

The Swagger documentation is configured in `src/main.ts` with the following settings:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS Frontend API')
  .setDescription('API documentation for the NestJS Frontend application using GOV.UK Frontend')
  .setVersion('1.0')
  .build();
```

### Best Practices for API Documentation

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

### Example Documentation

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

### Security Documentation

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

### Maintaining Documentation

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

For more detailed information about Swagger documentation, see the [Swagger Documentation Guide](docs/swagger-documentation.md).

## Logging

The application uses a robust logging system built on Winston. For detailed information about the logging system, including configuration, usage, and best practices, see the [Logging Documentation](docs/logging.md).

Key features:
- Multiple log levels (error, warn, info, debug, verbose)
- Context-aware logging
- Structured JSON logging for files
- Colored console output for development
- Separate error log file
- Stack trace capture for errors

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for new development

### Testing

- Write unit tests for services and controllers
- Use Jest for testing
- Maintain good test coverage

#### Component Testing

The application includes a comprehensive component testing system that verifies GOV.UK Frontend components against official test fixtures. To run component tests:

1. Run all component tests:
```bash
npm test -- --testPathPattern=govuk-components
```

2. Run specific component tests:
```bash
npm test -- --testPathPattern=button.component
```

3. Generate test coverage:
```bash
npm run test:cov
```

Component tests automatically:
- Compare rendered output with official GOV.UK Frontend fixtures
- Generate detailed test reports in `test-output/govuk-components/`
- Verify component accessibility and styling
- Test multiple scenarios for each component

For detailed information about component testing, see [Component Testing Documentation](docs/component-testing.md).

### Documentation

- Document complex functions and classes
- Keep README up to date
- Use JSDoc for API documentation

## Deployment

The application can be deployed using:

```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Updating GOV.UK Frontend

The application uses the GOV.UK Frontend package (`govuk-frontend`) for styling and components. The current version is specified in `package.json`.

### Before Updating

1. Check the [GOV.UK Frontend release notes](https://github.com/alphagov/govuk-frontend/releases) for:
   - Breaking changes
   - New features
   - Deprecated features
   - Required migration steps

2. Review the current integration:
   ```bash
   npm list govuk-frontend
   ```

### Update Process

1. Update the package version:
   ```bash
   npm install govuk-frontend@latest
   ```
   Or for a specific version:
   ```bash
   npm install govuk-frontend@x.x.x
   ```

2. Update static assets:
   - The application serves GOV.UK Frontend assets from:
     ```
     node_modules/govuk-frontend/dist/govuk
     ```
   - Assets are automatically served via the static asset configuration in `main.ts`

3. Run component tests:
   ```bash
   npm run test:govuk
   ```
   This ensures all GOV.UK components still render correctly after the update.

### Post-Update Checklist

1. Verify template paths in `view-engine.service.ts` are correct:
   ```typescript
   const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');
   ```

2. Check component imports in Nunjucks templates:
   - Update any changed macro paths
   - Review deprecated components
   - Test new component features if applicable

3. Update CSS/SCSS imports if using custom styles

4. Test the application:
   - Run all tests: `npm test`
   - Check visual appearance of components
   - Verify responsive Behaviour
   - Test accessibility features

### Troubleshooting

Common issues after updating:

1. Missing assets
   - Verify the static asset paths in `main.ts`
   - Check the `govuk-frontend` package structure hasn't changed

2. Component rendering issues
   - Compare component usage with latest documentation
   - Check for breaking changes in the release notes
   - Review component test output in `test-output/govuk-components/`

3. Style conflicts
   - Review any custom styles that might override GOV.UK Frontend
   - Check for deprecated or changed class names

For detailed information about GOV.UK Frontend versions and migration guides, visit the [official documentation](https://frontend.design-system.service.gov.uk/).

### Request Validation

The application uses class-validator and class-transformer for request validation. This provides automatic validation of all incoming client payloads against DTO classes.

#### Validation Features

- Automatic validation of request payloads
- Type transformation and conversion
- Whitelisting of properties
- Custom validation decorators
- Nested object validation
- Array validation
- Conditional validation

#### Basic Usage

1. **Create a DTO (Data Transfer Object)**

```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

2. **Use in Controller**

```typescript
@Controller('users')
export class UsersController {
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    // The DTO will be automatically validated
    return this.userService.create(createUserDto);
  }
}
```

#### Common Validation Decorators

- `@IsString()` - Must be a string
- `@IsNumber()` - Must be a number
- `@IsEmail()` - Must be a valid email
- `@IsOptional()` - Field is optional
- `@MinLength()` - Minimum string length
- `@MaxLength()` - Maximum string length
- `@IsArray()` - Must be an array
- `@ValidateNested()` - Validate nested objects
- `@IsEnum()` - Must be a value from enum
- `@Matches()` - Must match regex pattern

#### Custom Validation

You can create custom validation decorators:

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class CustomTextValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    return text.startsWith('custom');
  }

  defaultMessage() {
    return 'Text must start with "custom"';
  }
}

// Usage
export class CustomDto {
  @Validate(CustomTextValidator)
  text: string;
}
```

#### Validation Groups

You can use validation groups for conditional validation:

```typescript
export class UserDto {
  @IsString()
  @MinLength(3, { groups: ['create'] })
  name: string;

  @IsEmail()
  email: string;
}

// In controller
@Post()
createUser(@Body(new ValidationPipe({ groups: ['create'] })) userDto: UserDto) {
  // ...
}
```

#### Error Handling

Validation errors are automatically handled and return a 400 Bad Request response with detailed error messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "name must be longer than or equal to 3 characters"
  ],
  "error": "Bad Request"
}
```

#### Best Practices

1. **DTO Organisation**
   - Keep DTOs in a dedicated directory (e.g., `src/dto`)
   - Use clear naming conventions (e.g., `CreateUserDto`, `UpdateUserDto`)
   - Document DTOs with comments and examples

2. **Validation Rules**
   - Use appropriate validation decorators
   - Consider using validation groups for complex scenarios
   - Add custom validation when needed
   - Keep validation rules consistent

3. **Error Messages**
   - Use descriptive error messages
   - Consider internationalisation
   - Provide helpful error details
   - Handle validation errors gracefully

For more information about validation, see the [class-validator documentation](https://github.com/typestack/class-validator) and [class-transformer documentation](https://github.com/typestack/class-transformer).

## Caching

The application includes Redis-based caching functionality using `@nestjs/cache-manager`. This provides a robust and scalable caching solution for improving application performance.

### Configuration

Caching is configured through environment variables in the `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600
```

- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `CACHE_TTL`: Default time-to-live for cached items in seconds (default: 3600)

### Usage

The `CacheService` provides a simple interface for caching data:

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class YourService {
  constructor(private readonly cacheService: CacheService) {}

  async getData() {
    // Try to get data from cache first
    const cachedData = await this.cacheService.get('your-key');
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch and store
    const data = await this.fetchData();
    await this.cacheService.set('your-key', data, 3600); // Cache for 1 hour
    return data;
  }
}
```

### Cache Service Methods

- `get<T>(key: string)`: Retrieve a value from the cache
- `set(key: string, value: any, ttl?: number)`: Store a value in the cache
- `del(key: string)`: Remove a value from the cache
- `clear()`: Clear all values from the cache

### Best Practices

1. **Cache Key Strategy**
   - Use consistent and descriptive key patterns
   - Include relevant identifiers in keys
   - Consider using namespaces for different types of data

2. **Cache Invalidation**
   - Implement appropriate cache invalidation strategies
   - Use the `del` method to remove specific items
   - Use the `clear` method sparingly, only when necessary

3. **TTL Management**
   - Set appropriate TTL values based on data volatility
   - Consider using different TTLs for different types of data
   - Monitor cache hit rates to optimise TTL settings

## Documentation

### Core Documentation
- [Component Management](docs/component-management.md) - Guidelines for component development and maintenance
- [Configuration Management](docs/configuration-management.md) - Environment and configuration management
- [Deployment and CI/CD](docs/deployment-cicd.md) - Build, deployment, and continuous integration processes
- [Team Collaboration](docs/team-collaboration.md) - Team workflows and collaboration practices
- [Compliance and Governance](docs/compliance-governance.md) - Compliance requirements and governance procedures
- [Error Handling](docs/error-handling.md) - Error management and logging practices
- [Dependency Management](docs/dependency-management.md) - Package and dependency management
- [Training and Onboarding](docs/training-onboarding.md) - Onboarding processes and training materials
- [API Integration Patterns](docs/api-integration-patterns.md) - API design and integration patterns

### Technical Documentation
- [Performance Monitoring](docs/performance-monitoring.md) - Performance optimisation and monitoring
- [Security Best Practices](docs/security-best-practices.md) - Security standards and practices
- [Testing Strategies](docs/testing-strategies.md) - Testing methodologies and tools
- [Accessibility Compliance](docs/accessibility-compliance.md) - Accessibility standards and practices
 