# PoC: NestJS Frontend Application

A proof of concept (PoC) for a HMCTS NestJS application with GOV.UK Frontend integration, designed to replace the existing [HMCTS Express.js template](https://github.com/hmcts/expressjs-template).

:rotating_light: **Note**: This PoC is not intended for use with ExUI at this stage; its application is envisioned as a future goal of the project. :rotating_light:

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
- Advanced frontend performance optimisations
- Service worker for offline support
- Comprehensive performance monitoring and metrics
- Enhanced security features
- Response compression and browser caching
- Optimized middleware chain
- **Static asset fingerprinting** for optimal cache performance

> 💡 **Why NestJS?** Discover how NestJS + Express.js + GOV.UK Frontend provides a more powerful and maintainable solution compared to vanilla Express.js in our [Key Features Guide](docs/KEYFEATURES.md).

## Migration Guide

:rotating_light: **Note**: This PoC is not intended for use with ExUI at this stage; its application is envisioned as a future goal of the project. :rotating_light:

We provide comprehensive documentation for migrating from the [HMCTS Express.js template](https://github.com/hmcts/expressjs-template) to this NestJS-based solution:

- [Migration Guide](./docs/migration-guide.md) - Step-by-step migration strategies and considerations
- [Migration Benefits](./docs/migration-benefits.md) - Detailed analysis of benefits and improvements over the Express.js template
- [Technical Examples](./docs/technical-migration-examples.md) - Code comparisons and parallel running strategies

The migration documentation includes:
- Multiple migration strategies
- Technical considerations
- Risk mitigation approaches
- Timeline planning
- Success criteria
- Specific benefits and improvements
- Code comparison examples
- Parallel running implementation

## Documentation

### Getting Started
- [Installation and Setup](./docs/readme/getting-started.md)
- [Project Structure](./docs/readme/project-structure.md)
- [Development Guidelines](./docs/readme/development-guidelines.md)

### Core Features
- [API Documentation](./docs/readme/api-documentation.md)
- [Caching](./docs/readme/caching.md)
- [Request Validation](./docs/readme/validation.md)
- [GOV.UK Frontend Integration](./docs/readme/govuk-frontend.md)
- [Frontend Performance](./docs/readme/frontend-performance.md)
- [Security Features](./docs/security.md)
- [Asset Fingerprinting](./docs/asset-fingerprinting.md) - Content-based fingerprinting for optimal browser caching

### Additional Documentation
- [Dependency Injection Best Practices](./docs/dependency-injection.md)
- [Security Best Practices](./docs/security-best-practices.md)
- [Error Handling](./docs/error-handling.md)
- [Health Checks](./docs/health-checks.md)
- [TypeORM Migration Guide](./docs/typeorm-migration.md)
- [Prisma Migration Guide](./docs/prisma-migration.md)
- [Process Isolation](./docs/process-isolation.md)
- [Monorepo Architecture](./docs/monorepo-architecture.md)
- [React Integration Guide](./docs/react-nestjs-integration.md) - **Not Recommended for Government Services**
- [TypeScript and Babel Setup](./docs/typescript-babel-setup.md)

## Building frontend assets

```bash
# build all frontend assets (SCSS, copy assets, fingerprint)
npm run build:frontend

# build SCSS only
npm run build:scss

# watch SCSS for changes
npm run build:scss:watch

# copy static assets only
npm run copy:assets

# fingerprint assets only
npm run fingerprint:assets
```

## Asset Fingerprinting

This project implements static asset fingerprinting without using bundlers like Webpack. Fingerprinting adds a content hash to filenames (e.g., `main.a1b2c3d4.css`), which enables efficient browser caching while ensuring users always get the latest version when files change.

In templates, use the `assetPath` function to resolve paths to fingerprinted assets:

```nunjucks
<link href="{{ assetPath('/css/main.css') }}" rel="stylesheet">
<img src="{{ assetPath('/images/logo.png') }}" alt="Logo">
<script src="{{ assetPath('/js/app.js') }}"></script>
```

Key benefits:
- Long-term caching (1 year) with immutable flag for optimal performance
- No revalidation requests when users refresh the page
- Automatic cache busting when content changes
- No complex bundler configuration required

Read more in [Asset Fingerprinting Documentation](docs/asset-fingerprinting.md).

## Dependencies

### Core Dependencies
- [NestJS](https://nestjs.com/) v11.1.0+
- [Express](https://expressjs.com/) v5.1.0+
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/releases/latest) v5.10.0+
- [TypeScript](https://www.typescriptlang.org/) v5.1.3+
- [Node.js](https://github.com/nodejs/release#release-schedule) v20.12.2+

### Key Features
- Axios HTTP client for API integration
- Redis caching with cache-manager v6.4.2
- Winston logging with structured output
- Swagger/OpenAPI documentation
- Rate limiting with @nestjs/throttler v6.4.0
- Compression middleware with configurable settings
- Browser-side caching with smart invalidation
- Helmet.js security headers v8.1.0
- Nunjucks templating engine - the official and default templating language used by GOV.UK Design System, ensuring perfect compatibility and maintainability with [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/releases/latest).
- Class-validator v0.14.1 for request validation
- Class-transformer v0.5.1 for object transformation
- TypeORM for database operations
- Prisma ORM support
- Process isolation for CPU-intensive tasks
- Service worker for offline support
- Performance monitoring and metrics
- CSRF protection with csurf v1.2.2
- Content Security Policy
- Comprehensive security headers
- Permissions policy
- CORS configuration
- Asset fingerprinting with immutable caching

### Development Tools
- Jest v29.7.0 for testing with comprehensive performance API mocking
- Prettier v3.0.0 for code formatting
- ESLint for code linting
- TypeScript strict mode enabled
- SASS v1.71.1 for CSS preprocessing
- Supertest v7.1.0 for API testing
- Renovate bot for dependency updates
- PostCSS v8.4.35 for CSS optimisation
- Babel v7.24.0 for JavaScript transpilation

## Dependency Management

This project uses [Renovate](https://renovatebot.com/) to automatically keep dependencies up to date. The Renovate configuration is defined in `renovate.json` and includes:

- Automated dependency updates
- Scheduled update checks
- Version constraint management
- Update grouping
- Automated merge requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
