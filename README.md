# PoC: NestJS Frontend Application

A proof of concept (PoC) for a HMCTS NestJS application with GOV.UK Frontend integration, designed to replace the existing [HMCTS Express.js template](https://github.com/hmcts/expressjs-template).

## Project Status

| Category            | Status                                                      |
| ------------------- | ----------------------------------------------------------- |
| **Build**           | ✅ Passing                                                  |
| **Tests**           | ✅ All tests passing (~1,505 Jest tests across ~68 suites; Playwright e2e separate) |
| **Dependencies**    | ✅ Up to date (July 2026) - All pinned to exact versions                           |
| **Security**        | ✅ 0 vulnerabilities                                                              |
| **GOV.UK Frontend** | ✅ v6.3.0 (Latest) — macros are the UI source of truth                             |
| **Node.js**         | ✅ >=26.5.0 <27 (.nvmrc 26.5.0)                                                    |
| **npm**             | ✅ >=11.18.0 <12                                                                  |

### Current Features

- ✅ Full GOV.UK Design System integration with component parity testing
- ✅ NestJS v11.1.28 with Express v5.2.1 adapter
- ✅ Comprehensive test suite (Jest + Playwright) - ~1,505 Jest tests across ~68 suites
- ✅ Jest coverage thresholds at 100% (statements, branches, functions, lines)
- ✅ Asset fingerprinting for optimal caching
- ✅ Docker support for development and production
- ✅ Swagger/OpenAPI documentation
- ✅ Security headers and CSRF protection
- ✅ Performance monitoring and metrics
- ✅ **Find a Court or Tribunal (FaCT) prototype journey** with form validation
- ✅ All dependencies pinned to exact versions; SHA verification via `bash scripts/verify-package-security.sh` after batch updates
- ✅ robots.txt configured to prevent search engine crawling

## Super Quick Start guide

Full walkthrough for **local Node** and **Docker**: [Getting Started](./docs/readme/getting-started.md).

### Option A — Local Node.js (no Docker)

```bash
# Install dependencies (use Node from .nvmrc: nvm use)
npm install

# Start development server with hot reload (builds and watches frontend assets)
npm run start:dev
```

Open **http://localhost:3002**

### Option B — Docker

```bash
# Prepare lockfile (recommended)
./scripts/prepare-docker.sh

# Build and run the default Compose service on port 3100
docker compose up --build frontend
```

Open **http://localhost:3100**

Optional bind-mount profile (host **3101** → container **3100**):

```bash
docker compose --profile dev up --build frontend-dev
```

### Production Build (local)

```bash
npm install
npm run build:prod
npm run start:prod
```

### Testing

```bash
# Run all tests (unit, integration, GOV.UK, and E2E)
npm run test:all

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run GOV.UK component tests
npm run test:govuk

# Run end-to-end tests in all browsers
npm run test:e2e:browsers

# Run end-to-end tests locally (with proper setup)
npm run test:e2e:local

# Run tests with coverage (thresholds are 100%)
npm run test:cov
```

### Running with Docker (detail)

Prefer Compose V2: `docker compose` (`docker-compose` also works if installed).

#### Default service (`frontend`)

```bash
./scripts/prepare-docker.sh
docker compose build frontend
docker compose up frontend
# Or: docker compose up -d frontend
```

#### Bind-mount profile (`frontend-dev`)

```bash
docker compose --profile dev up --build frontend-dev
# Or: docker compose --profile dev up -d frontend-dev
```

#### Accessing the Application

Use **http** unless you terminate TLS elsewhere:

| Mode | URL |
|------|-----|
| Local Node (`npm run start:dev`) | http://localhost:3002 |
| Docker `frontend` | http://localhost:3100 |
| Docker `frontend-dev` | http://localhost:3101 |

#### Docker Commands

```bash
docker compose down
docker compose logs -f frontend
docker compose up --build frontend
docker compose down --rmi local --volumes --remove-orphans
```

Validate without a long build:

```bash
./scripts/validate-docker.sh
./scripts/test-docker-config.sh
```

The application uses a clear separation of test types:

- **Unit and Integration Tests** (`test/` directory)
  - Jest-based tests for individual components and their interactions
  - Files must end with `.spec.ts`
  - Run with `npm run test:unit` or `npm run test:integration`

- **End-to-End Tests** (`tests/` directory)
  - Playwright-based tests for complete user journeys
  - Tests for homepage, health checks, and navigation
  - Run with `npm run test:e2e` or browser-specific commands
  - Use `npm run test:e2e:local` for local development with proper setup

For detailed information about testing:

- [Testing Strategy](docs/testing.md) - Comprehensive testing documentation
- [End-to-End Testing with Playwright](docs/playwright-testing.md) - Guide for E2E testing
- [Playwright Test Improvements](docs/playwright-improvements.md) - Recent fixes and enhancements
- [GOV.UK Component Testing](docs/component-testing.md) - Guide for component parity testing

### Available Scripts

#### Development

- `npm run start:dev` - Start development server with hot reload, automatically builds frontend assets and watches for changes
- `npm run start:debug` - Start in debug mode with watch enabled
- `npm run build:frontend:dev` - Build frontend assets optimized for development (skips fingerprinting)
- `npm run build:frontend:watch` - Watch and rebuild frontend assets

#### Building

- `npm run build` - Build the backend application
- `npm run build:prod` - Build both backend and frontend for production
- `npm run build:frontend` - Build frontend assets for production (SCSS, copy assets, fingerprint)

#### Testing

- `npm run test:unit` - Run all unit tests
- `npm run test:integration` - Run all integration tests
- `npm run test:unit:watch` - Run unit tests in watch mode
- `npm run test:integration:watch` - Run integration tests in watch mode
- `npm run test:unit:debug` - Run unit tests in debug mode
- `npm run test:integration:debug` - Run integration tests in debug mode
- `npm run test:govuk` - Run GOV.UK component tests
- `npm run test:govuk:watch` - Run GOV.UK component tests in watch mode
- `npm run test:govuk:debug` - Run GOV.UK component tests in debug mode
- `npm run test:e2e` - Run all end-to-end tests
- `npm run test:e2e:ui` - Run end-to-end tests with UI mode
- `npm run test:e2e:debug` - Run end-to-end tests in debug mode
- `npm run test:e2e:browsers` - Run end-to-end tests in all browsers
- `npm run test:e2e:chromium` - Run end-to-end tests in Chrome
- `npm run test:e2e:firefox` - Run end-to-end tests in Firefox
- `npm run test:e2e:webkit` - Run end-to-end tests in Safari
- `npm run test:e2e:local` - Run end-to-end tests locally with proper setup
- `npm run test:cov` - Run all tests with coverage
- `npm run test:cov:unit` - Run unit tests with coverage
- `npm run test:cov:integration` - Run integration tests with coverage
- `npm run test:cov:govuk` - Run GOV.UK component tests with coverage
- `npm run test:all` - Run all tests (unit, integration, GOV.UK, and E2E)
- `npm run test:all:watch` - Run all tests in watch mode (concurrently)

#### Code Quality

- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run lint:check` - Check code style without fixing

For detailed information about all available scripts, see the [Build Scripts Documentation](docs/build-scripts.md).

## Project Overview

This application is a modern web application built with NestJS and GOV.UK Frontend, providing a robust foundation for government digital services built on Node.js. It includes:

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
- Enhanced security features including custom CSRF protection
- Response compression and browser caching
- Optimized middleware chain
- Static asset fingerprinting for optimal cache performance
- Microservices architecture support
- Intelligent 404 error handling with pattern-based exclusions

### Prototype Journeys

#### Find a Court or Tribunal (FaCT)

A prototype user journey demonstrating GOV.UK Design System patterns including:

- Radio button selection with server-side validation
- Search functionality with filtered results
- GOV.UK Error Summary and field-level error messages
- Accessible form validation following GDS patterns

Access the prototype at `/find-a-court-or-tribunal` when running the application.

> 💡 **Why NestJS?** Discover how NestJS + Express.js + GOV.UK Frontend provides a more powerful and maintainable solution compared to vanilla Express.js in our [Key Features Guide](docs/KEYFEATURES.md).

## Package Versions

This project uses the following key package versions (last updated: July 2026):

### Core Dependencies

- NestJS Framework: v11.1.28
- Express.js: v5.2.1
- GOV.UK Frontend: v6.3.0
- TypeScript: v6.0.3 (pinned; not 7 because of ts-jest compatibility)
- Node.js: >=26.5.0 <27
- npm: >=11.18.0 <12

### Key Features

- NestJS Core: v11.1.28
- NestJS Swagger: v11.4.5
- NestJS Config: v4.0.4
- NestJS Axios: v4.0.1
- NestJS Cache Manager: v3.1.3
- NestJS Terminus: v11.1.1
- NestJS Throttler: v6.5.0

### Testing & Development

- Jest: v30.4.2 (100% coverage thresholds)
- Playwright: v1.61.1
- Prettier: v3.9.5
- ESLint: v10.7.0
- SASS: v1.101.0
- Babel: v7.29.7
- Supertest: v7.2.2

For a complete list of dependencies and their versions, please refer to the `package.json` file.

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

📚 **[Complete Documentation](./docs/README.md)** - Comprehensive documentation covering all aspects of the application

### Quick Links

#### 🚀 Getting Started

- [Installation and Setup](./docs/readme/getting-started.md) - Get up and running quickly
- [Project Structure](./docs/readme/project-structure.md) - Understand the codebase organization
- [Development Guidelines](./docs/readme/development-guidelines.md) - Best practices and coding standards

#### 🏗️ Core Features

- [Key Features](./docs/KEYFEATURES.md) - Why NestJS over vanilla Express.js
- [API Documentation](./docs/readme/api-documentation.md) - Swagger/OpenAPI documentation
- [GOV.UK Frontend Integration](./docs/readme/govuk-frontend.md) - Using GOV.UK Design System
- [Caching Strategy](./docs/readme/caching.md) - Redis caching implementation
- [Security Features](./docs/security.md) - Built-in security implementations

#### ✅ Testing & Quality

- [Testing Guide](./docs/testing.md) - Unit, integration, and E2E testing
- [Playwright E2E Testing](./docs/playwright-testing.md) - End-to-end testing with Playwright
- [Playwright Test Improvements](./docs/playwright-improvements.md) - Recent fixes and enhancements
- [Request Validation](./docs/readme/validation.md) - Input validation and sanitization

#### 🚀 Performance & Optimization

- [Frontend Performance](./docs/readme/frontend-performance.md) - Optimization strategies
- [Asset Fingerprinting](./docs/asset-fingerprinting.md) - Cache-busting and performance
- [Performance Monitoring](./docs/performance-monitoring.md) - Application monitoring

#### 🔄 Migration & Integration

- [Migration Guide](./docs/migration-guide.md) - Migrating from Express.js template
- [API Integration Patterns](./docs/api-integration-patterns.md) - External API integration
- [API Mocking & Prototypes](./docs/api-mocking-prototype.md) - Development with mock APIs

#### 🔧 Advanced Features

- [Microservices Architecture](./docs/microservices-architecture.md) - Scaling with microservices
- [Process Isolation](./docs/process-isolation.md) - CPU-intensive task handling
- [Health Checks](./docs/health-checks.md) - Application health monitoring
- [Error Handling](./docs/error-handling.md) - Comprehensive error management

#### 🛠️ Development Tools

- [Build Scripts](./docs/build-scripts.md) - Understanding the build process
- [TypeScript & Babel Setup](./docs/typescript-babel-setup.md) - TypeScript configuration
- [Dependency Management](./docs/dependency-management.md) - Managing dependencies

> 📖 **For the complete documentation index with all available guides, visit [docs/README.md](./docs/README.md)**

## Building and Running the Application

### Quick Start

```bash
# Install dependencies
npm install

# Build backend and frontend for production
npm run build:prod

# Start production server
npm run start:prod
```

### Development Mode

```bash
# Start development server (automatically builds and watches frontend assets)
npm run start:dev
```

### Available Build Scripts

The project includes various build scripts for different purposes:

```bash
# NestJS application build
npm run build                 # Compile the application
npm run start                 # Start the compiled application
npm run start:dev             # Start with auto-reload and frontend asset watching
npm run start:debug           # Start in debug mode
npm run start:prod            # Run production build

# Frontend assets
npm run build:frontend        # Build all frontend assets for production (SCSS, copy assets, fingerprint)
npm run build:frontend:dev    # Build frontend assets optimized for development (skips fingerprinting)
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
npm run test:e2e:local       # Run E2E tests locally with proper setup
```

For detailed information about all build scripts, see the [Build Scripts Documentation](docs/build-scripts.md).

For detailed information about testing:

- [Testing Strategy](docs/testing.md)
- [Unit Testing Guide](docs/unit-testing.md)
- [End-to-End Testing with Playwright](docs/playwright-testing.md)
- [Playwright Test Improvements](docs/playwright-improvements.md)
- [GOV.UK Component Testing](docs/component-testing.md)

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

- [NestJS](https://nestjs.com/) v11.1.28
- [Express](https://expressjs.com/) v5.2.1
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/releases/latest) v6.3.0 (Nunjucks macros are the UI source of truth)
- [TypeScript](https://www.typescriptlang.org/) v6.0.3
- [Node.js](https://github.com/nodejs/release#release-schedule) >=26.5.0 <27
- [npm](https://www.npmjs.com/) >=11.18.0 <12

### Key Features

- Axios HTTP client for API integration v1.18.1
- Redis caching with cache-manager v7.2.9
- Winston logging with structured output v3.19.0
- Swagger/OpenAPI documentation
- Rate limiting with @nestjs/throttler v6.5.0
- Compression middleware with configurable settings
- Browser-side caching with smart invalidation
- Helmet.js security headers v8.3.0
- Nunjucks templating engine - the official and default templating language used by GOV.UK Design System
- Class-validator v0.15.1 for request validation
- Class-transformer v0.5.1 for object transformation
- TypeORM for database operations
- Prisma ORM support
- Process isolation for CPU-intensive tasks
- Service worker for offline support
- Performance monitoring and metrics
- Custom CSRF protection with cryptographic token generation
- Content Security Policy
- Comprehensive security headers
- Permissions policy
- CORS configuration
- Asset fingerprinting with immutable caching
- Intelligent 404 error handling with pattern-based exclusions
- robots.txt configured to prevent search engine crawling

### Development Tools

- Jest v30.4.2 for unit and integration testing (100% coverage thresholds)
- Playwright v1.61.1 for end-to-end testing
- Prettier v3.9.5 for code formatting
- ESLint v10.7.0 for code linting
- TypeScript strict mode enabled
- SASS v1.101.0 for CSS preprocessing
- Supertest v7.2.2 for API testing
- Renovate bot for dependency updates
- PostCSS v8.5.19 for CSS optimisation
- Babel v7.29.7 for JavaScript transpilation
- All dependencies pinned to exact versions; SHA verification via `bash scripts/verify-package-security.sh` after batch updates

## Dependency Management

This project uses [Renovate](https://renovatebot.com/) to automatically keep dependencies up to date. The Renovate configuration is defined in `renovate.json` and includes:

- Automated dependency updates
- **7-day minimum release age** before routine update PRs (security alerts are not delayed)
- Scheduled update checks
- Version constraint management
- Update grouping
- Automated merge requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
