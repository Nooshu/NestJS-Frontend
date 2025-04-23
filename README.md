# NestJS Frontend Application

A NestJS application with GOV.UK Frontend integration.

## Project Overview

This application is a modern web application built with NestJS and GOV.UK Frontend, providing a robust foundation for government digital services. It includes:

- Modern TypeScript-based architecture
- GOV.UK Frontend integration for consistent styling
- Comprehensive testing suite
- API documentation with Swagger
- Robust logging and error handling
- Redis-based caching
- Request validation
- Security best practices

## Documentation

### Getting Started
- [Installation and Setup](docs/readme/getting-started.md)
- [Project Structure](docs/readme/project-structure.md)
- [Development Guidelines](docs/readme/development-guidelines.md)

### Core Features
- [API Documentation](docs/readme/api-documentation.md)
- [Caching](docs/readme/caching.md)
- [Request Validation](docs/readme/validation.md)
- [GOV.UK Frontend Integration](docs/readme/govuk-frontend.md)

### Additional Documentation
- [Dependency Injection Best Practices](docs/dependency-injection.md)
- [Security Best Practices](docs/security-best-practices.md)
- [Error Handling](docs/error-handling.md)
- [Health Checks](docs/health-checks.md)
- [TypeORM Migration Guide](docs/typeorm-migration.md)
- [Prisma Migration Guide](docs/prisma-migration.md)

## Dependencies

### Core Dependencies
- NestJS v11.0.0
- Express v5.1.0
- GOV.UK Frontend v5.9.0
- TypeScript v5.1.3
- Node.js v20 or later

### Key Features
- Axios HTTP client for API integration
- Redis caching with cache-manager
- Winston logging with structured output
- Swagger/OpenAPI documentation
- Rate limiting with @nestjs/throttler
- Compression middleware
- Helmet.js security headers
- Nunjucks templating engine
- Class-validator for request validation
- Class-transformer for object transformation

### Development Tools
- Jest for testing
- Prettier for code formatting
- ESLint for code linting
- TypeScript strict mode enabled
- SASS for CSS preprocessing
- Supertest for API testing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 