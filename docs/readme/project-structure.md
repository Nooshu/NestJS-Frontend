# Project Structure

```
src/
├── adapters/        # Adapter implementations for external services
├── api/            # API endpoints and controllers
├── cache/          # Caching functionality
│   ├── cache.module.ts  # Cache module configuration
│   └── cache.service.ts # Cache service implementation
├── core/           # Core application functionality
├── logger/         # Logging functionality
│   ├── logger.module.ts # Logger module configuration
│   └── logger.service.ts # Logger service implementation
├── modules/        # Feature modules
├── shared/         # Shared utilities and services
│   ├── config/    # Configuration files
│   ├── constants/ # Application constants
│   ├── decorators/# Custom decorators
│   ├── guards/    # Authentication/Authorisation guards
│   ├── interfaces/# TypeScript interfaces
│   ├── middleware/# Custom middleware
│   ├── services/  # Shared services
│   └── utils/     # Utility functions
├── views/          # Nunjucks templates
└── public/         # Static assets
```

## Documentation

- [Dependency Injection Best Practices](../dependency-injection.md) - Guidelines for managing dependency injection and ensuring stateless services
- [API Documentation](./api-documentation.md) - Swagger/OpenAPI documentation for API endpoints
- [Security Best Practices](../security-best-practices.md) - Security guidelines and best practices
- [Error Handling](../error-handling.md) - Error handling patterns and practices
- [Health Checks](../health-checks.md) - Application health monitoring and checks
- [TypeORM Migration Guide](../typeorm-migration.md) - Guide for migrating to TypeORM
- [Prisma Migration Guide](../prisma-migration.md) - Guide for migrating to Prisma 