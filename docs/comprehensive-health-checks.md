# Comprehensive Health Check System

This document describes the comprehensive health check system implemented for the NestJS frontend application. The system provides multiple health monitoring endpoints and indicators to ensure application reliability and observability.

## Overview

The health check system is built using `@nestjs/terminus` and provides:

- **Multiple Health Indicators**: Database, Redis, HTTP services, and application-specific checks
- **Specialized Endpoints**: Different endpoints for various monitoring needs
- **Kubernetes Support**: Readiness and liveness probes for container orchestration
- **Comprehensive Monitoring**: System resources, performance metrics, and dependency health
- **Error Handling**: Graceful degradation and detailed error reporting

## Health Check Endpoints

### Basic Health Check
**Endpoint**: `GET /health`

Basic health check that monitors critical system metrics:
- Memory usage (heap and RSS)
- Disk storage availability

```bash
curl http://localhost:3002/health
```

**Response Example**:
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
  }
}
```

### Detailed Health Check
**Endpoint**: `GET /health/detailed`

Comprehensive health check including all system components:
- System resources (memory, disk)
- Application metrics (uptime, configuration, performance)
- External dependencies (database, Redis)

```bash
curl http://localhost:3002/health/detailed
```

**Response Example**:
```json
{
  "status": "ok",
  "info": {
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk_health": { "status": "up" },
    "app_uptime": {
      "status": "up",
      "startTime": "2025-01-01T00:00:00.000Z",
      "uptimeFormatted": "1d 2h 30m 45s"
    },
    "app_config": {
      "status": "up",
      "environment": "production",
      "nodeVersion": "v24.13.0"
    },
    "app_performance": {
      "status": "up",
      "memoryUsageMB": {
        "heapUsed": 45,
        "heapTotal": 67
      }
    }
  }
}
```

### Database Health Check
**Endpoint**: `GET /health/database`

Monitors database connectivity and performance:

```bash
curl http://localhost:3002/health/database
```

### Redis Health Check
**Endpoint**: `GET /health/redis`

Monitors Redis connectivity and memory usage:

```bash
curl http://localhost:3002/health/redis
```

### HTTP Services Health Check
**Endpoint**: `GET /health/http`

Monitors external HTTP service dependencies:

```bash
# Check default endpoints
curl http://localhost:3002/health/http

# Check custom endpoints
curl "http://localhost:3002/health/http?urls=https://api.example.com,https://service.example.com"
```

### Application Health Check
**Endpoint**: `GET /health/application`

Application-specific health metrics:
- Uptime monitoring
- Configuration validation
- Performance metrics
- Internal dependencies

```bash
curl http://localhost:3002/health/application
```

### System Resources Health Check
**Endpoint**: `GET /health/system`

System resource monitoring:
- Memory usage with higher thresholds
- Disk storage monitoring
- Performance metrics

```bash
curl http://localhost:3002/health/system
```

### Kubernetes Probes

#### Readiness Probe
**Endpoint**: `GET /health/ready`

Determines if the application is ready to receive traffic:

```yaml
# Kubernetes deployment example
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3002
  initialDelaySeconds: 10
  periodSeconds: 5
```

#### Liveness Probe
**Endpoint**: `GET /health/live`

Determines if the application should be restarted:

```yaml
# Kubernetes deployment example
livenessProbe:
  httpGet:
    path: /health/live
    port: 3002
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Health Indicators

### Database Health Indicator

**Features**:
- Connection status monitoring
- Query response time measurement
- Configurable timeout thresholds
- Error handling and reporting

**Configuration**:
```typescript
// Replace simulation with actual database connection
async isHealthy(key: string): Promise<HealthIndicatorResult> {
  // Your database connection logic here
  const connection = await this.databaseService.getConnection();
  // ... health check implementation
}
```

### Redis Health Indicator

**Features**:
- Connection ping monitoring
- Memory usage tracking
- Performance metrics
- Connection status reporting

**Methods**:
- `isHealthy()`: Basic connectivity check
- `checkMemoryUsage()`: Memory utilization monitoring

### HTTP Health Indicator

**Features**:
- Multiple endpoint monitoring
- Response time measurement
- Status code validation
- Timeout configuration
- Bulk endpoint checking

**Usage**:
```typescript
// Single endpoint check
await this.http.pingCheck('api', 'https://api.example.com', {
  timeout: 5000,
  expectedStatus: 200,
  expectedResponseTime: 3000
});

// Multiple endpoints check
await this.http.checkMultipleEndpoints('services', [
  { name: 'API', url: 'https://api.example.com' },
  { name: 'Auth', url: 'https://auth.example.com' }
]);
```

### Application Health Indicator

**Features**:
- Uptime monitoring
- Configuration validation
- Performance metrics
- Dependency status checking

**Methods**:
- `checkUptime()`: Application uptime tracking
- `checkConfiguration()`: Environment and config validation
- `checkPerformance()`: Memory and CPU monitoring
- `checkDependencies()`: Internal service dependencies

## Configuration

### Environment Variables

```bash
# Health check configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_MEMORY_THRESHOLD=512
HEALTH_CHECK_DISK_THRESHOLD=0.9

# Database health check
DATABASE_HEALTH_TIMEOUT=1000
DATABASE_HEALTH_ENABLED=true

# Redis health check
REDIS_HEALTH_TIMEOUT=500
REDIS_HEALTH_MEMORY_THRESHOLD=80

# HTTP services health check
HTTP_HEALTH_TIMEOUT=5000
HTTP_HEALTH_RETRY_COUNT=3
```

### Module Integration

Add the health module to your application:

```typescript
// app.module.ts
import { HealthModule } from './shared/health/health.module';

@Module({
  imports: [
    // ... other modules
    HealthModule,
  ],
})
export class AppModule {}
```

## Monitoring and Alerting

### Prometheus Integration

The health endpoints can be integrated with Prometheus for monitoring:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'nestjs-health'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: '/health/detailed'
    scrape_interval: 30s
```

### Grafana Dashboard

Create dashboards to visualize:
- Application uptime
- Memory usage trends
- Response times
- Error rates
- Dependency health status

### Alerting Rules

Set up alerts for:
- Application down (liveness probe failure)
- High memory usage
- Database connectivity issues
- External service failures
- Disk space warnings

## Error Handling

### Health Check Failures

When health checks fail, the system provides detailed error information:

```json
{
  "status": "error",
  "error": {
    "database": {
      "status": "down",
      "message": "Database connection timeout",
      "error": "ConnectionTimeoutError",
      "responseTime": 5000
    }
  }
}
```

### Graceful Degradation

The system handles partial failures gracefully:
- Non-critical services don't affect overall health status
- Detailed error reporting for debugging
- Configurable timeout and retry mechanisms

## Testing

### Unit Tests

Run health indicator tests:

```bash
npm test src/shared/health
```

### Integration Tests

Test health endpoints:

```bash
# Test basic health check
curl -f http://localhost:3002/health || echo "Health check failed"

# Test with timeout
timeout 10s curl http://localhost:3002/health/detailed
```

### Load Testing

Monitor health under load:

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3002/health

# Using curl in a loop
for i in {1..100}; do
  curl -s http://localhost:3002/health > /dev/null
  echo "Request $i completed"
done
```

## Best Practices

### Health Check Design

1. **Keep checks lightweight**: Health checks should be fast and not impact performance
2. **Use appropriate timeouts**: Set reasonable timeouts for external dependencies
3. **Implement circuit breakers**: Prevent cascading failures
4. **Monitor trends**: Track health metrics over time
5. **Test failure scenarios**: Regularly test what happens when dependencies fail

### Kubernetes Configuration

1. **Set appropriate delays**: Allow time for application startup
2. **Configure retry policies**: Handle temporary failures gracefully
3. **Use different endpoints**: Separate readiness and liveness concerns
4. **Monitor probe metrics**: Track probe success/failure rates

### Security Considerations

1. **Limit exposed information**: Don't expose sensitive configuration details
2. **Implement authentication**: Secure health endpoints if needed
3. **Rate limiting**: Prevent abuse of health check endpoints
4. **Audit logging**: Log health check access for security monitoring

## Troubleshooting

### Common Issues

1. **Health checks timing out**:
   - Check network connectivity
   - Verify service availability
   - Adjust timeout configurations

2. **Memory threshold exceeded**:
   - Monitor application memory usage
   - Check for memory leaks
   - Adjust threshold values

3. **Database connectivity issues**:
   - Verify database server status
   - Check connection pool settings
   - Review network configuration

4. **External service failures**:
   - Verify service endpoints
   - Check API keys and authentication
   - Review firewall and network settings

### Debugging

Enable debug logging for health checks:

```typescript
// Enable debug logging
const logger = new Logger('HealthCheck');
logger.debug('Health check started', { endpoint: '/health/detailed' });
```

Monitor health check performance:

```bash
# Monitor response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3002/health
```

## Future Enhancements

### Planned Features

1. **Custom Metrics**: Application-specific business metrics
2. **Historical Data**: Health check history and trends
3. **Notification System**: Real-time alerts and notifications
4. **Dashboard UI**: Web-based health monitoring dashboard
5. **Auto-scaling Integration**: Trigger scaling based on health metrics

### Integration Opportunities

1. **APM Tools**: New Relic, DataDog, AppDynamics integration
2. **Log Aggregation**: ELK stack, Splunk integration
3. **Incident Management**: PagerDuty, OpsGenie integration
4. **CI/CD Pipeline**: Health checks in deployment pipelines

This comprehensive health check system provides robust monitoring capabilities for your NestJS application, ensuring high availability and reliable operation in production environments.
