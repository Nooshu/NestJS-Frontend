# Performance Metrics Implementation

This document describes the comprehensive performance metrics system implemented in the NestJS frontend application.

## Overview

The application now includes a comprehensive performance monitoring system that tracks Core Web Vitals and custom application metrics, outputting detailed information to the browser console.

## Features

### Core Web Vitals
- **LCP (Largest Contentful Paint)** - Time for largest content element to render
- **FID (First Input Delay)** - Time from first user interaction to browser response  
- **INP (Interaction to Next Paint)** - Modern replacement for FID, measures interaction responsiveness
- **CLS (Cumulative Layout Shift)** - Visual stability score
- **FCP (First Contentful Paint)** - Time for first content to render
- **TTFB (Time to First Byte)** - Server response time

### Custom Application Metrics
- **MemoryUsage** - JavaScript heap memory usage in MB
- **BundleSize** - Size of JavaScript bundles in bytes
- **RouteChange** - Time for SPA route transitions in milliseconds
- **DOMContentLoaded** - Time for DOM to be fully parsed
- **PageLoad** - Complete page load time
- **UserInteraction** - Custom tracking of user interactions (clicks, scrolls, etc.)

## Implementation Details

### Files Modified/Created

1. **`src/frontend/js/performance-monitor.js`** - Enhanced with comprehensive metrics tracking
2. **`src/frontend/js/performance-service.js`** - Updated to enable monitoring in all environments
3. **`src/frontend/js/main.js`** - Updated to initialize performance monitoring with console output
4. **`src/views/layout.njk`** - Updated to include the main.js module
5. **`src/views/performance-demo.njk`** - New demo page for testing performance metrics
6. **`src/views/views.controller.ts`** - Added route for performance demo page

### Key Features

#### Real-time Monitoring
- Memory usage is monitored every 5 seconds
- User interactions are tracked in real-time
- Route changes are automatically detected and timed

#### Console Output
The system provides formatted console output with emojis and clear descriptions:

```
🚀 Performance Metrics Report
📈 Core Web Vitals
LCP: 1234ms - Largest Contentful Paint - Time for largest content element to render
FID: 45ms - First Input Delay - Time from first user interaction to browser response
INP: 45ms - Interaction to Next Paint - Modern replacement for FID, measures interaction responsiveness
CLS: 0.1 - Cumulative Layout Shift - Visual stability score
FCP: 800ms - First Contentful Paint - Time for first content to render
TTFB: 200ms - Time to First Byte - Server response time

⚙️ Custom Application Metrics
MemoryUsage: 15MB - JavaScript heap memory usage
BundleSize: 250KB - Size of JavaScript bundles
RouteChange: 50ms - Time for SPA route transitions
DOMContentLoaded: 300ms - Time for DOM to be fully parsed
PageLoad: 1200ms - Complete page load time
UserInteraction: 5 - Custom tracking of user interactions (clicks, scrolls, etc.)
```

#### Individual Metric Logging
Each metric is also logged individually as it becomes available:

```
📊 Memory Usage: {usedJSHeapSize: 15, totalJSHeapSize: 50, jsHeapSizeLimit: 2000, timestamp: 1234567890}
📦 Bundle Size: {totalSize: 256000, totalSizeKB: 250, totalSizeMB: 0.24, files: [...], timestamp: 1234567890}
👆 User Interaction: {type: "click", timestamp: 1234567890, target: "BUTTON", targetId: "test-button-1", ...}
```

## Usage

### Testing the Implementation

1. **Start the development server:**
   ```bash
   npm run start:dev
   ```

2. **Navigate to the performance demo page:**
   ```
   http://localhost:3100/performance-demo
   ```

3. **Open browser developer console** to see the performance metrics

4. **Interact with the page** (click buttons, scroll, navigate) to see real-time tracking

### Browser Compatibility

- **Memory Usage**: Requires Chrome/Chromium with `--enable-precise-memory-info` flag
- **Core Web Vitals**: Supported in modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance Observer API**: Supported in browsers with Performance Observer support

### Configuration

The performance monitoring can be configured through the `PerformanceMonitor` class:

```javascript
// Enable/disable console output
performanceMonitor.setConfig({ enableConsoleOutput: true });

// Configure sampling rate
performanceService.setConfig({ sampleRate: 1.0 }); // 100% sampling

// Enable/disable monitoring
performanceService.setConfig({ isMonitoringEnabled: true });
```

## Technical Implementation

### Performance Observer API
The implementation uses the modern Performance Observer API to track:
- Navigation timing
- Resource timing
- Long tasks
- Layout shifts
- First input delay
- Largest contentful paint
- First contentful paint

### Memory Monitoring
Memory usage is tracked using `performance.memory` API (Chrome only):
- `usedJSHeapSize` - Currently used heap size
- `totalJSHeapSize` - Total allocated heap size
- `jsHeapSizeLimit` - Maximum heap size limit

### Route Change Tracking
Route changes are tracked by intercepting:
- `history.pushState()`
- `history.replaceState()`
- `popstate` events

### User Interaction Tracking
User interactions are tracked for:
- Clicks
- Scrolls
- Key presses
- Touch events

## Development Notes

### Environment Support
- **Development**: Full monitoring enabled with console output
- **Production**: Monitoring enabled, reporting to backend (if configured)

### Performance Impact
- Minimal performance impact due to passive event listeners
- Memory monitoring runs every 5 seconds (configurable)
- User interaction tracking uses passive listeners

### Error Handling
- Graceful fallback when Performance Observer API is not available
- Error handling for memory API when not supported
- Safe handling of missing browser APIs

## Future Enhancements

Potential future improvements:
1. **Backend Integration**: Send metrics to analytics service
2. **Real User Monitoring (RUM)**: Collect metrics from real users
3. **Performance Budgets**: Alert when metrics exceed thresholds
4. **Historical Tracking**: Store and compare metrics over time
5. **Custom Metrics**: Add application-specific performance indicators

## Troubleshooting

### Common Issues

1. **No metrics in console**: Ensure browser supports Performance Observer API
2. **Memory metrics not showing**: Use Chrome with `--enable-precise-memory-info` flag
3. **Route change metrics not working**: Ensure using modern routing (not full page reloads)

### Debug Mode

Enable debug logging by setting:
```javascript
performanceMonitor.setConfig({ enableConsoleOutput: true });
```

This will provide detailed logging of all performance events and metrics.
