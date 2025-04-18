# Health Checks Documentation

This document outlines the health check implementation in the NestJS Frontend application using `@nestjs/terminus`.

## Overview

The application provides two health check endpoints:
- Basic health check (`/health`)
- Detailed health check (`/health/detailed`)

These endpoints monitor various aspects of the application's health and provide status information in a standardized format.

## Endpoints

### Basic Health Check

**Endpoint:** `GET /health`

Monitors critical system metrics:
- Memory heap usage (150MB threshold)
- RSS memory usage (150MB threshold)
- Disk storage (90% threshold)

Example response:
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk_health": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    // Same as info
  }
}
```

### Detailed Health Check

**Endpoint:** `GET /health/detailed`

Provides comprehensive system information including:
- All basic health checks
- Application version
- Environment information
- Node.js version
- Platform details
- Detailed memory usage statistics

Example response:
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk_health": {
      "status": "up"
    },
    "app_info": {
      "status": "up",
      "version": "0.1.0",
      "environment": "development",
      "node": "v18.x.x",
      "platform": "darwin",
      "memory": {
        "status": "up",
        "heapUsed": 123456,
        "heapTotal": 789012,
        "rss": 345678
      }
    }
  },
  "error": {},
  "details": {
    // Same as info
  }
}
```

## Response Status Codes

- **200 OK**: All health checks passed
- **503 Service Unavailable**: One or more health checks failed

## Configuration

Health check thresholds are configured in `src/shared/health/health.controller.ts`:

- Memory heap threshold: 150MB
- RSS memory threshold: 150MB
- Disk storage threshold: 90%

## Adding Custom Health Checks

To add new health checks:

1. Inject the required health indicator in the `HealthController` constructor
2. Add the new check to the relevant endpoint's check array

Example adding a database health check:

```typescript
constructor(
  private health: HealthCheckService,
  private db: TypeOrmHealthIndicator // Add new indicator
) {}

@Get()
@HealthCheck()
check() {
  return this.health.check([
    // Existing checks...
    () => this.db.pingCheck('database') // Add new check
  ]);
}
```

## Dependencies

The health check system uses the following NestJS packages:
- `@nestjs/terminus`: Core health check functionality
- `@nestjs/axios`: HTTP health checks (if needed)

These are already included in the project's dependencies. 