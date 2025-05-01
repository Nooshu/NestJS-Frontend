# Technical Migration Examples

This document provides specific technical examples comparing the HMCTS Express.js template with our NestJS solution, along with strategies for running both in parallel.

## Parallel Running Strategy

### 1. Nginx Reverse Proxy Setup

```nginx
# nginx.conf
http {
    upstream express_app {
        server localhost:3100;  # Express.js template
    }

    upstream nestjs_app {
        server localhost:3000;  # NestJS application
    }

    # Feature flag based routing
    map $http_x_feature_flag $backend {
        default "express_app";
        "~^enabled$" "nestjs_app";
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://$backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Feature-Flag $http_x_feature_flag;
        }
    }
}
```

### 2. Feature Flag Implementation

```typescript
// Express.js template (src/middleware/featureFlag.ts)
export const featureFlagMiddleware = (req, res, next) => {
  const featureFlag = req.headers['x-feature-flag'];
  if (featureFlag === 'enabled') {
    // Redirect to NestJS application
    res.redirect(`http://localhost:3000${req.path}`);
  } else {
    next();
  }
};

// NestJS (src/middleware/feature-flag.middleware.ts)
@Injectable()
export class FeatureFlagMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    const featureFlag = req.headers['x-feature-flag'];
    if (featureFlag !== 'enabled') {
      // Redirect to Express.js application
      res.redirect(`http://localhost:3100${req.path}`);
    } else {
      next();
    }
  }
}
```

## Code Comparison Examples

### 1. Route Definition

**Express.js Template:**
```typescript
// src/routes/index.ts
import { Router } from 'express';
const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export default router;
```

**NestJS:**
```typescript
// src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(200)
  getHealth() {
    return { status: 'UP' };
  }
}
```

### 2. Middleware Implementation

**Express.js Template:**
```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
};
```

**NestJS:**
```typescript
// src/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: exception.message,
      });
  }
}
```

### 3. Service Implementation

**Express.js Template:**
```typescript
// src/services/userService.ts
export class UserService {
  private users = [];

  async findUser(id: string) {
    return this.users.find(user => user.id === id);
  }

  async createUser(userData) {
    this.users.push(userData);
    return userData;
  }
}
```

**NestJS:**
```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  private users = [];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
}
```

### 4. Configuration Management

**Express.js Template:**
```typescript
// config/default.json
{
  "port": 3100,
  "session": {
    "secret": "your-secret-key",
    "cookie": {
      "secure": true
    }
  }
}

// src/app.ts
import config from 'config';
app.use(session(config.get('session')));
```

**NestJS:**
```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  session: {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### 5. Testing Examples

**Express.js Template:**
```typescript
// test/unit/routes/health.test.ts
import request from 'supertest';
import app from '../../../src/app';

describe('Health endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'UP' });
  });
});
```

**NestJS:**
```typescript
// src/health/health.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status', () => {
    expect(controller.getHealth()).toEqual({ status: 'UP' });
  });
});
```

## Parallel Running Benefits

1. **Gradual Migration**
   - Migrate one route/feature at a time
   - Test new implementation without affecting existing users
   - Roll back easily if issues arise

2. **A/B Testing**
   - Compare performance between implementations
   - Gather user feedback on new features
   - Validate improvements before full migration

3. **Load Balancing**
   - Distribute traffic between both applications
   - Monitor performance and resource usage
   - Gradually shift traffic to NestJS

4. **Development Workflow**
   - Developers can work on both codebases
   - Share common utilities and types
   - Maintain backward compatibility

## Implementation Steps

1. **Setup Parallel Environment**
   ```bash
   # Start Express.js application
   cd express-app
   yarn start

   # Start NestJS application
   cd nestjs-app
   yarn start
   ```

2. **Configure Feature Flags**
   ```bash
   # Enable NestJS for specific routes
   curl -H "X-Feature-Flag: enabled" http://localhost/health
   ```

3. **Monitor Both Applications**
   ```bash
   # Monitor Express.js logs
   tail -f express-app/logs/app.log

   # Monitor NestJS logs
   tail -f nestjs-app/logs/app.log
   ```

4. **Shared Resources**
   - Use the same database
   - Share session storage
   - Common configuration values
   - Shared static assets

## Migration Checklist

1. **Setup Phase**
   - [ ] Configure Nginx reverse proxy
   - [ ] Set up feature flags
   - [ ] Configure shared resources
   - [ ] Set up monitoring

2. **Development Phase**
   - [ ] Migrate routes one by one
   - [ ] Implement parallel testing
   - [ ] Update documentation
   - [ ] Train developers

3. **Testing Phase**
   - [ ] Test both applications
   - [ ] Validate feature flags
   - [ ] Performance testing
   - [ ] Security testing

4. **Deployment Phase**
   - [ ] Deploy both applications
   - [ ] Configure load balancing
   - [ ] Monitor performance
   - [ ] Gather feedback

5. **Completion Phase**
   - [ ] Migrate remaining routes
   - [ ] Remove Express.js application
   - [ ] Update documentation
   - [ ] Archive old codebase 