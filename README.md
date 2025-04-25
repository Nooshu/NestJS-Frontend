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
- Process isolation for CPU-intensive tasks
- TypeORM and Prisma ORM support
- Automated dependency updates with Renovate bot
- Advanced frontend performance optimizations
- Service worker for offline support
- Comprehensive performance monitoring and metrics
- Real-time performance tracking
- User interaction monitoring
- Visual performance metrics
- Enhanced security features
- CSRF protection
- Content Security Policy
- Comprehensive security headers
- Permissions policy
- CORS configuration

> 💡 **Why NestJS?** Discover how NestJS + Express.js + GOV.UK Frontend provides a more powerful and maintainable solution compared to vanilla Express.js in our [Key Features Guide](docs/KEYFEATURES.md).

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
- [Frontend Performance](docs/readme/frontend-performance.md)
- [Security Features](docs/security.md)

### Additional Documentation
- [Dependency Injection Best Practices](docs/dependency-injection.md)
- [Security Best Practices](docs/security-best-practices.md)
- [Error Handling](docs/error-handling.md)
- [Health Checks](docs/health-checks.md)
- [TypeORM Migration Guide](docs/typeorm-migration.md)
- [Prisma Migration Guide](docs/prisma-migration.md)
- [Process Isolation](docs/process-isolation.md)
- [Express.js to NestJS Migration Guide](docs/express-migration.md)
- [Monorepo Architecture](docs/monorepo-architecture.md)
- [React Integration Guide](docs/react-nestjs-integration.md) - **Not Recommended for Government Services**

## Dependencies

### Core Dependencies
- [NestJS](https://nestjs.com/) v11.0.0+
- [Express](https://expressjs.com/) v5.1.0+
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/releases/latest) v5.9.0+
- [TypeScript](https://www.typescriptlang.org/) v5.1.3+
- [Node.js](https://github.com/nodejs/release#release-schedule) v20+

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
- TypeORM for database operations
- Prisma ORM support
- Process isolation for CPU-intensive tasks
- Webpack for frontend optimization
- Service worker for offline support
- Performance monitoring and metrics
- Real-time performance tracking
- User interaction monitoring
- Visual performance metrics
- CSRF protection with csurf
- Content Security Policy
- Comprehensive security headers
- Permissions policy
- CORS configuration

### Development Tools
- Jest for testing
- Prettier for code formatting
- ESLint for code linting
- TypeScript strict mode enabled
- SASS for CSS preprocessing
- Supertest for API testing
- Renovate bot for dependency updates
- Webpack for frontend bundling
- PostCSS for CSS optimization
- Babel for JavaScript transpilation

## Frontend Performance Features
- Code splitting and lazy loading
- Asset optimization and minification
- CSS optimization with PostCSS
- Service worker for offline support
- Performance monitoring and metrics
- Resource timing tracking
- Long task detection
- Navigation timing metrics
- Cache-first strategy for static assets
- Automatic asset versioning
- Real-time performance tracking
- User interaction monitoring
- Visual performance metrics
- Layout shift monitoring
- First input delay tracking
- Largest contentful paint tracking
- Time to interactive monitoring
- Total blocking time tracking

## Security Features
- CSRF protection with secure cookies
- Content Security Policy with nonce-based script security
- Comprehensive security headers
- Strict permissions policy
- CORS configuration
- CSP violation reporting
- Secure cookie settings
- Token validation
- API route exclusions
- Automatic token generation

## Dependency Management

This project uses [Renovate](https://renovatebot.com/) to automatically keep dependencies up to date. The Renovate configuration is defined in `renovate.json` and includes:

- Automated dependency updates
- Scheduled update checks
- Version constraint management
- Update grouping
- Automated merge requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 