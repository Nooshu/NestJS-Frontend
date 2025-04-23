# Dependency Injection Best Practices

## Overview

This document outlines the best practices for managing dependency injection in NestJS applications, with a focus on ensuring services remain stateless and maintainable.

## Table of Contents

1. [Scopes](#scopes)
2. [Stateless Services](#stateless-services)
3. [Request Scoped Services](#request-scoped-services)
4. [Transient Services](#transient-services)
5. [Configuration Management](#configuration-management)
6. [Factory Providers](#factory-providers)
7. [Cross-Cutting Concerns](#cross-cutting-concerns)

## Scopes

NestJS provides three different scopes for dependency injection:

- `DEFAULT` (Singleton) - One instance shared across the application
- `REQUEST` - New instance for each request
- `TRANSIENT` - New instance for each injection

### Best Practices for Scopes

- Use `DEFAULT` scope for stateless services
- Use `REQUEST` scope for services that need request-specific data
- Use `TRANSIENT` scope when you need a fresh instance for each injection

## Stateless Services

### Key Principles

- Avoid storing state in class properties
- Pass state through method parameters
- Use dependency injection to get required services
- Use the `@Injectable()` decorator with appropriate scope

### Example

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService
  ) {}

  // Stateless method - all data passed as parameters
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

## Request Scoped Services

Use the `REQUEST` scope when you need request-specific data:

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getUserId(): string {
    return this.request.user.id;
  }
}
```

## Transient Services

Use the `TRANSIENT` scope for services that need their own context:

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string) {
    // Use context for logging
  }
}
```

## Configuration Management

Instead of storing configuration in class properties, use dependency injection:

```typescript
@Injectable()
export class ConfigService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: ConfigOptions
  ) {}

  getConfig(): ConfigOptions {
    return this.options;
  }
}
```

## Factory Providers

Use factory providers for complex instantiation logic:

```typescript
const serviceProvider = {
  provide: 'SERVICE',
  useFactory: (config: ConfigService) => {
    return new Service(config.getOptions());
  },
  inject: [ConfigService],
};
```

## Cross-Cutting Concerns

Instead of storing state in services, use guards and interceptors for cross-cutting concerns:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.authService.validateRequest(request);
  }
}
```

## Best Practices Summary

1. **Choose Appropriate Scopes**
   - Use `DEFAULT` for stateless services
   - Use `REQUEST` for request-specific data
   - Use `TRANSIENT` for context-specific services

2. **Avoid State Storage**
   - Don't store mutable state in class properties
   - Pass data through method parameters
   - Use dependency injection for required services

3. **Configuration Management**
   - Use dependency injection for configuration
   - Avoid hardcoding configuration values
   - Use environment variables for sensitive data

4. **Cross-Cutting Concerns**
   - Use guards and interceptors
   - Keep services focused on their primary responsibility
   - Use middleware for request/response processing

5. **Testing Considerations**
   - Stateless services are easier to test
   - Use dependency injection for mocking
   - Consider scope when writing tests

By following these practices, you can ensure that your NestJS services remain stateless and maintainable, leading to a more scalable and maintainable application. 