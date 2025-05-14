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
- Static asset fingerprinting for optimal cache performance
- Microservices architecture support

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
- [Microservices Architecture](./docs/microservices-architecture.md) - Guide to using this project in a microservice architecture
- [End-to-End Testing](./docs/playwright-testing.md) - Comprehensive guide to E2E testing with Playwright

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

## Building and Running the Application

### Quick Start

```bash
# Install dependencies
npm install

# Build backend and frontend
npm run build && npm run build:frontend

# Start the application
npm run start:prod
```

### Development Mode

```bash
# Start backend with auto-reload (in one terminal)
npm run start:dev

# Watch frontend assets (in another terminal)
npm run build:frontend:watch
```

### Available Build Scripts

The project includes various build scripts for different purposes:

```bash
# NestJS application build
npm run build                 # Compile the application
npm run start                 # Start the compiled application
npm run start:dev             # Start with auto-reload
npm run start:debug           # Start in debug mode
npm run start:prod            # Run production build

# Frontend assets
npm run build:frontend        # Build all frontend assets (SCSS, copy assets, fingerprint)
npm run build:frontend:watch  # Watch and rebuild frontend assets
npm run build:scss            # Compile SCSS to CSS
npm run build:scss:watch      # Watch and compile SCSS
npm run copy:assets           # Copy static assets to output directory
npm run fingerprint:assets    # Generate fingerprinted assets

# Code quality
npm run format                # Format code with Prettier
npm run lint                  # Lint code with ESLint

# Testing
npm run test                  # Run all tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage report
npm run test:e2e              # Run end-to-end tests
npm run test:govuk            # Run GOV.UK component tests

# Unit and Integration Tests
npm run test                  # Run all unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage report
npm run test:govuk            # Run GOV.UK component tests

# End-to-End Tests with Playwright
npm run test:e2e:ui          # Run E2E tests with UI mode
npm run test:e2e:debug       # Run E2E tests in debug mode
npm run test:e2e:chromium    # Run E2E tests in Chrome
npm run test:e2e:firefox     # Run E2E tests in Firefox
npm run test:e2e:webkit      # Run E2E tests in Safari
```

For detailed information about all build scripts, see the [Build Scripts Documentation](docs/build-scripts.md).

For detailed information about testing:
- [Unit Testing Guide](docs/unit-testing.md)
- [End-to-End Testing with Playwright](docs/playwright-testing.md)
- [GOV.UK Component Testing](docs/govuk-testing.md)

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
- [NestJS](https://nestjs.com/) v11.1.1
- [Express](https://expressjs.com/) v5.1.0+
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/releases/latest) v5.10.0+
- [TypeScript](https://www.typescriptlang.org/) v5.4.2
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
- Jest v29.7.0 for unit and integration testing
- Playwright v1.52.0 for end-to-end testing
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
