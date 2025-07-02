# NestJS Frontend Documentation

Welcome to the comprehensive documentation for the NestJS Frontend application. This documentation covers all aspects of the application, from getting started to advanced configuration and deployment.

## Table of Contents

### 🚀 Getting Started
- [Getting Started Guide](readme/getting-started.md) - Installation, setup, and first steps
- [Project Structure](readme/project-structure.md) - Understanding the codebase organization
- [Development Guidelines](readme/development-guidelines.md) - Best practices and coding standards

### 🏗️ Core Architecture
- [Key Features](KEYFEATURES.md) - Why NestJS over vanilla Express.js
- [Configuration Management](configuration-management.md) - Environment variables and app configuration
- [Dependency Injection](dependency-injection.md) - Best practices for DI in NestJS
- [Core Module Structure](core-module.md) - Understanding the application's core modules

### 🎨 Frontend & UI
- [GOV.UK Frontend Integration](readme/govuk-frontend.md) - Using GOV.UK Design System components
- [Frontend Performance](readme/frontend-performance.md) - Optimization strategies and monitoring
- [Asset Fingerprinting](asset-fingerprinting.md) - Cache-busting and performance optimization
- [Component Management](component-management.md) - Managing and organizing UI components

### 🔌 API Integration
- [API Documentation](readme/api-documentation.md) - Swagger/OpenAPI documentation
- [API Integration Patterns](api-integration-patterns.md) - Best practices for external API integration
- [API Integration Guide](api-integration.md) - Detailed integration examples
- [API Mocking & Prototypes](api-mocking-prototype.md) - Development and testing with mock APIs

### 🗄️ Data & Caching
- [Caching Strategy](readme/caching.md) - Redis caching implementation
- [TypeORM Migration](typeorm-migration.md) - Database integration with TypeORM
- [Prisma Migration](prisma-migration.md) - Alternative ORM implementation

### 🔒 Security & Compliance
- [Security Best Practices](security-best-practices.md) - Comprehensive security guidelines
- [Security Features](security.md) - Built-in security implementations
- [Accessibility Compliance](accessibility-compliance.md) - WCAG compliance and accessibility features
- [Compliance & Governance](compliance-governance.md) - Regulatory compliance guidelines

### ✅ Testing & Quality
- [Testing Strategies](testing-strategies.md) - Comprehensive testing approach
- [Testing Guide](testing.md) - Unit, integration, and E2E testing
- [Playwright E2E Testing](playwright-testing.md) - End-to-end testing with Playwright
- [Component Testing](component-testing.md) - Testing UI components
- [Request Validation](readme/validation.md) - Input validation and sanitization

### 🚀 Build & Deployment
- [Build Scripts](build-scripts.md) - Understanding the build process
- [Deployment & CI/CD](deployment-cicd.md) - Deployment strategies and automation
- [Performance Monitoring](performance-monitoring.md) - Application monitoring and metrics
- [Performance Optimization](performance.md) - Performance tuning guidelines

### 🔧 Advanced Features
- [Microservices Architecture](microservices-architecture.md) - Scaling with microservices
- [Monorepo Architecture](monorepo-architecture.md) - Managing multiple applications
- [Process Isolation](process-isolation.md) - CPU-intensive task handling
- [Health Checks](health-checks.md) - Application health monitoring
- [Error Handling](error-handling.md) - Comprehensive error management
- [Logging](logging.md) - Structured logging with Winston

### 🔄 Migration & Integration
- [Migration Guide](migration-guide.md) - Migrating from Express.js template
- [Migration Benefits](migration-benefits.md) - Advantages of the NestJS approach
- [Technical Migration Examples](technical-migration-examples.md) - Code examples and comparisons
- [Express Migration](express-migration.md) - Detailed Express.js migration steps
- [React Integration](react-nestjs-integration.md) - React integration (not recommended for gov services)

### 🛠️ Development Tools
- [TypeScript & Babel Setup](typescript-babel-setup.md) - TypeScript configuration and tooling
- [Dependency Management](dependency-management.md) - Managing project dependencies
- [Team Collaboration](team-collaboration.md) - Collaboration tools and workflows
- [Training & Onboarding](training-onboarding.md) - Developer onboarding resources

### 📊 Documentation & Standards
- [Swagger Documentation](swagger-documentation.md) - API documentation with OpenAPI
- [Configuration Documentation](configuration.md) - Detailed configuration options

## Quick Reference

### Essential Commands
```bash
# Development
npm run start:dev          # Start development server
npm run build:frontend:dev # Build frontend assets for development

# Testing
npm run test:all          # Run all tests
npm run test:e2e          # Run end-to-end tests
npm run test:govuk        # Run GOV.UK component tests

# Production
npm run build:prod        # Build for production
npm run start:prod        # Start production server
```

### Key Directories
- `src/` - Application source code
- `src/views/` - Nunjucks templates
- `src/shared/` - Shared modules and utilities
- `src/adapters/` - External service adapters
- `docs/` - Documentation (you are here)
- `tests/` - End-to-end tests

### Important Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Testing configuration
- `playwright.config.ts` - E2E testing configuration

## Contributing

When adding new documentation:

1. Follow the existing structure and naming conventions
2. Include practical examples and code snippets
3. Update this table of contents when adding new documents
4. Ensure all links are working and up-to-date
5. Use clear, concise language suitable for developers

## Support

For questions about this documentation or the application:

1. Check the relevant documentation section first
2. Review the [Getting Started Guide](readme/getting-started.md)
3. Consult the [Development Guidelines](readme/development-guidelines.md)
4. Check existing issues and discussions in the project repository

---

*This documentation is maintained alongside the codebase and should be updated when making significant changes to the application.*
