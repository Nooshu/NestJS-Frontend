# Performance Configuration Guide

This document outlines the performance configuration options and best practices for the application.

## Overview

The application implements comprehensive performance optimisations including:
- Static asset caching
- Response compression
- Browser caching
- API performance monitoring
- Resource timing tracking
- Performance metrics collection
- View engine optimisation
- Route handling optimisation

## Configuration Structure

### 1. Static Assets
```typescript
staticAssets: {
  maxAge: 86400000, // 24 hours
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  },
}
```

### 2. Compression
```typescript
compression: {
  level: 6,
  threshold: 1024,
}
```

### 3. Browser Cache
```typescript
browserCache: {
  maxAge: 31536000, // 1 year in seconds
  mustRevalidate: true,
}
```

### 4. API Performance
```typescript
apiPerformance: {
  connection: {
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 100,
    maxFreeSockets: 10,
  },
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
  cache: {
    standard: 300000, // 5 minutes
    short: 60000,    // 1 minute
    long: 3600000,   // 1 hour
  }
}
```

### 5. View Engine
```typescript
viewEngine: {
  autoescape: true,
  throwOnUndefined: false,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: process.env.NODE_ENV !== 'production',
  watch: process.env.NODE_ENV !== 'test',
}
```

### 6. Route Handling
```typescript
routeHandling: {
  globalPrefix: '', // No global prefix for better route organisation
  excludeRoutes: ['api', 'health'], // Routes to exclude from certain middleware
  middlewareOrder: [
    'error',
    'logging',
    'security',
    'compression',
    'static',
  ],
}
```

## Usage

### 1. Static Asset Caching
Configure static asset caching in your `.env` file:
```env
# Static Assets
STATIC_ASSETS_MAX_AGE=86400000
STATIC_ASSETS_IMMUTABLE=true
STATIC_ASSETS_ETAG=true
STATIC_ASSETS_LAST_MODIFIED=true
```

### 2. Compression Settings
Configure compression in your `.env` file:
```env
# Compression
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024
```

### 3. Browser Cache
Configure browser caching in your `.env` file:
```env
# Browser Cache
BROWSER_CACHE_MAX_AGE=31536000
BROWSER_CACHE_MUST_REVALIDATE=true
```

### 4. API Performance
Configure API performance in your `.env` file:
```env
# API Performance
API_KEEP_ALIVE=true
API_KEEP_ALIVE_MSECS=60000
API_MAX_SOCKETS=100
API_MAX_FREE_SOCKETS=10
API_RETRY_RETRIES=3
API_RETRY_FACTOR=2
API_RETRY_MIN_TIMEOUT=1000
API_RETRY_MAX_TIMEOUT=5000
API_CACHE_STANDARD=300000
API_CACHE_SHORT=60000
API_CACHE_LONG=3600000
```

### 5. View Engine
Configure view engine settings in your `.env` file:
```env
# View Engine
VIEW_ENGINE_AUTOESCAPE=true
VIEW_ENGINE_THROW_ON_UNDEFINED=false
VIEW_ENGINE_TRIM_BLOCKS=true
VIEW_ENGINE_LSTRIP_BLOCKS=true
VIEW_ENGINE_NO_CACHE=false
VIEW_ENGINE_WATCH=true
```

## Best Practices

### 1. Static Asset Caching
- Use immutable cache for static assets
- Set appropriate max-age values
- Enable ETag and Last-Modified headers
- Configure cache control headers

### 2. Compression
- Use appropriate compression level
- Set reasonable threshold values
- Enable compression for text-based assets
- Configure compression for API responses

### 3. Browser Cache
- Set appropriate cache durations
- Use cache validation headers
- Configure cache control policies
- Implement cache busting strategies

### 4. API Performance
- Configure connection pooling
- Implement retry strategies
- Use appropriate cache durations
- Monitor API performance

### 5. View Engine
- Enable autoescaping for security
- Configure appropriate caching based on environment
- Use trim and lstrip blocks for cleaner output
- Implement proper error handling
- Optimise template loading

### 6. Route Handling
- Organise routes logically without global prefixes
- Exclude appropriate routes from middleware
- Order middleware for optimal performance
- Implement proper error handling
- Use route-specific middleware where needed

## Monitoring

### 1. Performance Metrics
- Navigation timing
- Resource timing
- Long task detection
- Layout shifts
- First input delay
- Largest contentful paint
- Time to interactive
- Total blocking time
- View rendering time
- Route handling time

### 2. API Monitoring
- Response times
- Error rates
- Cache hit rates
- Connection pool usage
- Retry statistics

### 3. View Engine Monitoring
- Template compilation time
- Template rendering time
- Cache hit rates
- Error rates
- Memory usage

## Troubleshooting

### Common Issues
1. **Cache Issues**
   - Check cache headers
   - Verify cache configuration
   - Clear browser cache
   - Check cache control headers

2. **Compression Issues**
   - Verify compression settings
   - Check content types
   - Monitor compression ratios
   - Check response sizes

3. **API Performance**
   - Monitor response times
   - Check connection pool
   - Verify retry settings
   - Monitor cache usage

4. **View Engine Issues**
   - Check template compilation
   - Monitor rendering times
   - Verify cache settings
   - Check memory usage

5. **Route Handling Issues**
   - Verify route organisation
   - Check middleware order
   - Monitor route performance
   - Check error handling

## Additional Resources

- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Compression Best Practices](https://web.dev/uses-text-compression/)
- [Browser Cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [Express Routing](https://expressjs.com/en/guide/routing.html)

## References

- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
- [HTTP Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression)
- [Browser Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web Performance Best Practices](https://web.dev/fast/)
- [Cache Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
- [Nunjucks Performance](https://mozilla.github.io/nunjucks/api.html#performance)
- [Express Performance](https://expressjs.com/en/advanced/best-practice-performance.html)

# Recent Performance Improvements

## View Engine Optimisation
The application has been optimized for better view engine performance:

1. **Template Caching**
   - Environment-based caching configuration
   - Production mode caching enabled
   - Development mode caching disabled for easier debugging
   - Test mode caching disabled for consistent testing

2. **Template Optimisation**
   - Autoescaping enabled for security
   - Trim and lstrip blocks for cleaner output
   - Optimized template loading
   - Memory usage optimisation

3. **Error Handling**
   - Comprehensive error logging
   - Template compilation error handling
   - Rendering error handling
   - Memory leak prevention

## Route Handling Optimisation
The application's route handling has been optimized for better performance:

1. **Route Organisation**
   - Logical route grouping
   - No global prefix for better organisation
   - Clear route hierarchy
   - Efficient route matching

2. **Middleware Optimisation**
   - Optimized middleware order
   - Route-specific middleware
   - Performance-focused middleware configuration
   - Efficient error handling

3. **Performance Monitoring**
   - Route handling time tracking
   - Middleware performance monitoring
   - Error rate tracking
   - Memory usage monitoring

## Configuration
These optimizations can be configured through environment variables:

```env
# View Engine
VIEW_ENGINE_AUTOESCAPE=true
VIEW_ENGINE_THROW_ON_UNDEFINED=false
VIEW_ENGINE_TRIM_BLOCKS=true
VIEW_ENGINE_LSTRIP_BLOCKS=true
VIEW_ENGINE_NO_CACHE=false
VIEW_ENGINE_WATCH=true

# Route Handling
ROUTE_GLOBAL_PREFIX=
ROUTE_EXCLUDE_PATHS=api,health
ROUTE_MIDDLEWARE_ORDER=error,logging,security,compression,static
```

## Best Practices
When working with the optimized view engine and route handling:

1. **View Engine**
   - Use appropriate caching settings for each environment
   - Implement proper error handling
   - Monitor template compilation and rendering times
   - Optimize template structure

2. **Route Handling**
   - Organize routes logically
   - Use route-specific middleware where needed
   - Monitor route performance
   - Implement proper error handling

## Monitoring
Monitor the performance of these optimizations using:

1. **View Engine Metrics**
   - Template compilation time
   - Template rendering time
   - Cache hit rates
   - Memory usage
   - Error rates

2. **Route Handling Metrics**
   - Route handling time
   - Middleware execution time
   - Error rates
   - Memory usage
   - Request throughput

## Troubleshooting
Common issues and solutions:

1. **View Engine Issues**
   - Check template compilation
   - Monitor rendering times
   - Verify cache settings
   - Check memory usage
   - Review error logs

2. **Route Handling Issues**
   - Verify route organisation
   - Check middleware order
   - Monitor route performance
   - Check error handling
   - Review performance metrics 
