# API Mocking and Prototype Services

This guide explains how to create and use mock APIs for prototyping and development purposes in the NestJS Frontend application.

## Table of Contents
- [Overview](#overview)
- [Setting Up Mock APIs](#setting-up-mock-apis)
- [Creating Prototype Services](#creating-prototype-services)
- [Best Practices](#best-practices)
- [Example Implementation](#example-implementation)

## Overview

Mock APIs are essential tools for frontend development, allowing you to:
- Develop and test frontend features without a backend dependency
- Simulate different API responses and scenarios
- Create realistic prototypes quickly
- Test error handling and edge cases
- Work independently of backend teams

## Setting Up Mock APIs

### 1. Using MSW (Mock Service Worker)

We recommend using [MSW (Mock Service Worker)](https://mswjs.io/) for API mocking as it:
- Intercepts actual network requests
- Works in both development and testing environments
- Supports REST and GraphQL APIs
- Provides a realistic API simulation

Installation:
```bash
npm install msw --save-dev
```

### 2. Creating Mock Handlers

Create a new directory for your mock handlers:
```bash
mkdir -p src/mocks/handlers
```

Example handler setup:
```typescript
// src/mocks/handlers/api.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ]
      })
    )
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name: req.body.name
      })
    )
  })
]
```

### 3. Setting Up the Mock Service Worker

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw'
import { handlers } from './handlers/api'

export const worker = setupWorker(...handlers)
```

## Creating Prototype Services

### 1. Service Structure

Create prototype services that mirror your real API services:

```typescript
// src/services/prototype/user.service.ts
import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class PrototypeUserService {
  constructor(private readonly httpService: HttpService) {}

  async getUsers() {
    return this.httpService.get('/api/users').toPromise()
  }

  async createUser(userData: any) {
    return this.httpService.post('/api/users', userData).toPromise()
  }
}
```

### 2. Environment Configuration

Use environment variables to switch between mock and real APIs:

```typescript
// src/config/api.config.ts
export const apiConfig = {
  useMocks: process.env.USE_MOCK_API === 'true',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
}
```

## Best Practices

1. **Keep Mock Data Realistic**
   - Use realistic data structures
   - Include edge cases and error scenarios
   - Maintain consistency with API documentation

2. **Version Control**
   - Keep mock data in version control
   - Document mock API changes
   - Include mock data in code reviews

3. **Testing**
   - Write tests for mock handlers
   - Verify mock data consistency
   - Test error scenarios

4. **Documentation**
   - Document all mock endpoints
   - Include example requests and responses
   - Note any special scenarios or edge cases

## Example Implementation

### 1. Setting Up the Mock Environment

```typescript
// src/main.ts
import { worker } from './mocks/browser'

async function bootstrap() {
  if (process.env.USE_MOCK_API === 'true') {
    await worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
  // ... rest of your bootstrap code
}
```

### 2. Using the Prototype Service

```typescript
// src/modules/users/users.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common'
import { PrototypeUserService } from '../../services/prototype/user.service'

@Controller('users')
export class UsersController {
  constructor(private readonly userService: PrototypeUserService) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers()
  }

  @Post()
  async createUser(@Body() userData: any) {
    return this.userService.createUser(userData)
  }
}
```

### 3. Environment Configuration

```env
# .env.development
USE_MOCK_API=true
API_BASE_URL=http://localhost:3000
```

## Switching Between Mock and Real APIs

To switch between mock and real APIs:

1. Development with mocks:
```bash
USE_MOCK_API=true npm run start:dev
```

2. Development with real API:
```bash
USE_MOCK_API=false npm run start:dev
```

## Additional Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [API Integration Patterns](./api-integration-patterns.md)
- [Testing Strategies](./testing-strategies.md)

## Troubleshooting

Common issues and solutions:

1. **Mock not intercepting requests**
   - Verify MSW is properly initialized
   - Check request URLs match mock handlers
   - Ensure worker is started before app bootstrap

2. **CORS issues**
   - Configure CORS in mock handlers
   - Check browser console for CORS errors
   - Verify request origins

3. **Type mismatches**
   - Keep mock data types consistent with API types
   - Use TypeScript interfaces for mock data
   - Validate mock data against schemas 