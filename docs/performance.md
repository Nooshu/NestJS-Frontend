# Performance Optimisations

This document outlines the performance optimisations implemented in the NestJS application to ensure fast loading times and optimal user experience.

## Overview

The application implements several performance optimisations:

- Response Compression
- Static Asset Caching
- Browser Caching
- Asset Optimisation

## Response Compression

The application uses Gzip compression for responses to reduce bandwidth usage and improve load times:

```typescript
compression: {
  level: 6,      // Compression level (0-9)
  threshold: '1kb', // Only compress responses larger than 1kb
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return true;
  },
}
```

### Benefits
- Reduces bandwidth usage by up to 70%
- Improves page load times, especially on mobile networks
- Better user experience on slow connections
- Reduced server load

### Configuration Options
- `level`: Compression level (0-9)
  - 0: No compression
  - 6: Good balance between compression and CPU usage
  - 9: Maximum compression
- `threshold`: Minimum size to compress
- `filter`: Custom filter function for compression

## Static Asset Caching

Static assets are served with optimised caching headers to improve performance:

```typescript
staticAssets: {
  maxAge: '1y',      // Cache for 1 year
  immutable: true,   // Mark as immutable
  etag: true,        // Enable ETag generation
  lastModified: true, // Enable Last-Modified header
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}
```

### Features
- Long-term caching for static assets
- Immutable cache for versioned assets
- No caching for HTML files
- ETag support for cache validation
- Last-Modified headers for conditional requests

### Cache Control Headers
- `public`: Can be cached by any cache
- `max-age=31536000`: Cache for 1 year
- `immutable`: Asset will never change
- `no-cache`: Always validate with server

## Browser Caching

Browser caching is configured for optimal performance:

```typescript
browserCache: {
  maxAge: 31536000, // 1 year in seconds
  mustRevalidate: true,
}
```

### Benefits
- Reduced server load
- Faster page loads for returning visitors
- Better offline experience
- Reduced bandwidth usage

## Best Practices

### 1. Asset Versioning
- Use content hashes in filenames
- Enable immutable caching for versioned assets
- Example: `main.a1b2c3d4.js`

### 2. Compression Settings
- Adjust compression level based on CPU usage
- Set appropriate threshold for compression
- Monitor compression ratios
- Consider Brotli compression for modern browsers

### 3. Cache Control
- Use appropriate cache durations
- Implement cache busting for updates
- Consider CDN integration
- Use versioned URLs for long-term caching

### 4. Performance Monitoring
- Monitor page load times
- Track asset loading performance
- Measure compression effectiveness
- Use performance budgets

## Configuration

All performance settings can be adjusted in `src/shared/config/performance.config.ts`. The configuration is loaded in:

1. `src/main.ts` - For compression and static asset serving
2. `src/app.module.ts` - For module-level optimisations

## Troubleshooting

### Compression Issues
- Check compression ratios
- Monitor CPU usage
- Adjust compression level if needed
- Verify content types being compressed

### Caching Problems
- Verify cache headers
- Check ETag generation
- Ensure proper cache invalidation
- Test with different browsers

### Asset Loading
- Monitor asset loading times
- Check CDN performance
- Verify cache hit rates
- Test with different network conditions

## Performance Testing

### Tools
- Lighthouse
- WebPageTest
- Chrome DevTools Performance tab
- GTmetrix

### Metrics to Monitor
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

## References

- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
- [HTTP Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression)
- [Browser Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web Performance Best Practices](https://web.dev/fast/)
- [Cache Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) 
