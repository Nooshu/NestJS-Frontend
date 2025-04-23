# Caching

The application includes Redis-based caching functionality using `@nestjs/cache-manager`. This provides a robust and scalable caching solution for improving application performance.

## Configuration

Caching is configured through environment variables in the `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600
```

- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `CACHE_TTL`: Default time-to-live for cached items in seconds (default: 3600)

## Usage

The `CacheService` provides a simple interface for caching data:

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class YourService {
  constructor(private readonly cacheService: CacheService) {}

  async getData() {
    // Try to get data from cache first
    const cachedData = await this.cacheService.get('your-key');
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch and store
    const data = await this.fetchData();
    await this.cacheService.set('your-key', data, 3600); // Cache for 1 hour
    return data;
  }
}
```

## Cache Service Methods

- `get<T>(key: string)`: Retrieve a value from the cache
- `set(key: string, value: any, ttl?: number)`: Store a value in the cache
- `del(key: string)`: Remove a value from the cache
- `clear()`: Clear all values from the cache

## Best Practices

1. **Cache Key Strategy**
   - Use consistent and descriptive key patterns
   - Include relevant identifiers in keys
   - Consider using namespaces for different types of data

2. **Cache Invalidation**
   - Implement appropriate cache invalidation strategies
   - Use the `del` method to remove specific items
   - Use the `clear` method sparingly, only when necessary

3. **TTL Management**
   - Set appropriate TTL values based on data volatility
   - Consider using different TTLs for different types of data
   - Monitor cache hit rates to optimise TTL settings 