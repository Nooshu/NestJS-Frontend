# Express.js to NestJS Migration Guide

## Overview

This guide explains how to implement the strangler pattern when migrating from Express.js to NestJS. The strangler pattern allows for a gradual migration by running both Express.js and NestJS applications side by side, gradually moving routes from Express.js to NestJS.

## Why Use the Strangler Pattern?

- **Gradual Migration**: Move routes one at a time without disrupting the entire application
- **Risk Reduction**: Test new NestJS routes in production while maintaining the existing Express.js application
- **Learning Curve**: Team can learn NestJS gradually while maintaining the existing application
- **Rollback Capability**: Easy to rollback changes if issues arise

## Implementation Steps

### 1. Set Up NestJS Application

First, create a new NestJS application alongside your existing Express.js application:

```bash
nest new nestjs-app
```

### 2. Configure Express.js Integration

In your NestJS application's `main.ts`, you can access the underlying Express application:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Your Express.js application
  const expressApp = express();
  
  // Mount Express.js routes
  expressApp.use('/legacy', legacyRoutes);
  
  // Mount NestJS routes
  await app.listen(3000);
}
bootstrap();
```

### 3. Route Migration Strategy

1. **Identify Routes**: List all Express.js routes and their dependencies
2. **Prioritize**: Choose which routes to migrate first (consider complexity and usage)
3. **Implement**: Create NestJS controllers and services for each route
4. **Test**: Test the new NestJS route thoroughly
5. **Switch**: Update the routing to use the new NestJS implementation
6. **Monitor**: Monitor for any issues
7. **Repeat**: Continue with the next route

### 4. Shared Resources

To share resources between Express.js and NestJS:

```typescript
// shared/database.ts
export const database = {
  // Shared database connection
};

// In Express.js
import { database } from './shared/database';

// In NestJS
@Injectable()
export class DatabaseService {
  constructor() {
    this.connection = database;
  }
}
```

### 5. Middleware Handling

Handle middleware compatibility:

```typescript
// In NestJS
@Injectable()
export class LegacyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    // Convert Express.js middleware to NestJS middleware
    legacyMiddleware(req, res, next);
  }
}
```

## Best Practices

1. **Start Small**: Begin with simple, low-risk routes
2. **Maintain Consistency**: Keep the same API structure and response formats
3. **Shared Configuration**: Use environment variables for shared configuration
4. **Monitoring**: Implement proper logging and monitoring for both applications
5. **Testing**: Maintain comprehensive test coverage during migration
6. **Documentation**: Keep documentation updated as routes are migrated

## Common Challenges

1. **Session Management**: Handle session sharing between Express.js and NestJS
2. **Authentication**: Maintain consistent authentication across both applications
3. **Error Handling**: Ensure consistent error responses
4. **Performance**: Monitor for any performance impacts during the transition

## Example: Migrating a Simple Route

### Express.js Route
```typescript
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

### NestJS Route
```typescript
@Controller('api')
export class UsersController {
  @Get('users')
  getUsers() {
    return { users: [] };
  }
}
```

## Conclusion

The strangler pattern provides a safe and controlled way to migrate from Express.js to NestJS. By following this approach, you can:

- Maintain application stability during migration
- Learn and adapt to NestJS gradually
- Reduce risk by migrating routes incrementally
- Keep the application running while improving its architecture

Remember to:
- Plan the migration carefully
- Test thoroughly
- Monitor performance
- Keep documentation updated
- Involve the team in the migration process 