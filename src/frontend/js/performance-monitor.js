/**
 * PerformanceMonitor class for tracking and reporting web performance metrics.
 * Implements various performance observers to collect metrics like navigation timing,
 * resource timing, long tasks, and Core Web Vitals.
 * 
 * @class PerformanceMonitor
 */
class PerformanceMonitor {
  /**
   * Creates a new PerformanceMonitor instance.
   * Initializes the performance monitoring system with default configuration.
   * 
   * @constructor
   */
  constructor() {
    this.metrics = {};
    this.observers = new Set();
    this.config = {
      sampleRate: 1.0, // Sample 100% of page loads
      maxEntries: 100, // Maximum number of entries to store
      longTaskThreshold: 50, // Threshold for long tasks in milliseconds
      resourceSizeThreshold: 100 * 1024, // 100KB threshold for large resources
      enableConsoleOutput: true, // Enable console output for all metrics
    };
    this.routeChangeStartTime = null;
    this.userInteractions = [];
  }

  /**
   * Initializes all performance observers and starts collecting metrics.
   * Sets up observers for:
   * - Navigation timing
   * - Resource timing
   * - Long tasks
   * - Layout shifts
   * - First input delay
   * - Largest contentful paint
   * - Cumulative layout shift
   * - First contentful paint
   * - Time to interactive
   * - Total blocking time
   * - Memory usage
   * - Bundle size
   * - Route changes
   * - User interactions
   * 
   * @method init
   * @public
   */
  init() {
    if (window.performance) {
      this.observeNavigationTiming();
      this.observeResourceTiming();
      this.observeLongTasks();
      this.observeLayoutShifts();
      this.observeFirstInputDelay();
      this.observeLargestContentfulPaint();
      this.observeCumulativeLayoutShift();
      this.observeFirstContentfulPaint();
      this.observeTimeToInteractive();
      this.observeTotalBlockingTime();
      this.observeMemoryUsage();
      this.observeBundleSize();
      this.observeRouteChanges();
      this.observeUserInteractions();
      this.setupCoreWebVitalsReporting();
    }
  }

  // Observe navigation timing metrics
  observeNavigationTiming() {
    const timing = window.performance.timing;
    
    window.addEventListener('load', () => {
      this.metrics.navigation = {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domProcessing: timing.domComplete - timing.domLoading,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        firstByte: timing.responseStart - timing.requestStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        redirectTime: timing.redirectEnd - timing.redirectStart,
        appCache: timing.domainLookupStart - timing.fetchStart,
        unloadEvent: timing.unloadEventEnd - timing.unloadEventStart,
      };

      this.notifyObservers('navigation', this.metrics.navigation);
    });
  }

  // Observe resource timing metrics
  observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!this.metrics.resources) {
          this.metrics.resources = [];
        }
        
        const resourceMetrics = {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.initiatorType,
          startTime: entry.startTime,
          endTime: entry.responseEnd,
          dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
          tcpConnection: entry.connectEnd - entry.connectStart,
          serverResponse: entry.responseEnd - entry.responseStart,
          isLarge: entry.transferSize > this.config.resourceSizeThreshold,
        };

        this.metrics.resources.push(resourceMetrics);
        this.notifyObservers('resource', resourceMetrics);
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // Observe long tasks
  observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!this.metrics.longTasks) {
          this.metrics.longTasks = [];
        }

        if (entry.duration > this.config.longTaskThreshold) {
          const longTaskMetrics = {
            duration: entry.duration,
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            name: entry.name,
            attribution: entry.attribution,
          };

          this.metrics.longTasks.push(longTaskMetrics);
          this.notifyObservers('longTask', longTaskMetrics);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  // Observe layout shifts
  observeLayoutShifts() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!this.metrics.layoutShifts) {
          this.metrics.layoutShifts = [];
        }

        const layoutShiftMetrics = {
          value: entry.value,
          startTime: entry.startTime,
          sources: entry.sources,
          hadRecentInput: entry.hadRecentInput,
        };

        this.metrics.layoutShifts.push(layoutShiftMetrics);
        this.notifyObservers('layoutShift', layoutShiftMetrics);
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  // Observe first input delay
  observeFirstInputDelay() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.firstInput = {
          processingStart: entry.processingStart,
          startTime: entry.startTime,
          duration: entry.duration,
          target: entry.target,
          interactionId: entry.interactionId,
        };

        this.notifyObservers('firstInput', this.metrics.firstInput);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  // Observe largest contentful paint
  observeLargestContentfulPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.largestContentfulPaint = {
          startTime: entry.startTime,
          size: entry.size,
          element: entry.element,
          url: entry.url,
          loadTime: entry.startTime - performance.timing.navigationStart,
        };

        this.notifyObservers('largestContentfulPaint', this.metrics.largestContentfulPaint);
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Observe cumulative layout shift
  observeCumulativeLayoutShift() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.cumulativeLayoutShift = {
          value: entry.value,
          startTime: entry.startTime,
          sources: entry.sources,
        };

        this.notifyObservers('cumulativeLayoutShift', this.metrics.cumulativeLayoutShift);
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  // Observe first contentful paint
  observeFirstContentfulPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.firstContentfulPaint = {
          startTime: entry.startTime,
          size: entry.size,
          element: entry.element,
          url: entry.url,
          loadTime: entry.startTime - performance.timing.navigationStart,
        };

        this.notifyObservers('firstContentfulPaint', this.metrics.firstContentfulPaint);
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  // Observe time to interactive
  observeTimeToInteractive() {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      this.metrics.timeToInteractive = {
        value: timing.domInteractive - timing.navigationStart,
        startTime: timing.navigationStart,
        endTime: timing.domInteractive,
      };

      this.notifyObservers('timeToInteractive', this.metrics.timeToInteractive);
    });
  }

  // Observe total blocking time
  observeTotalBlockingTime() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalBlockingTime = 0;

      entries.forEach(entry => {
        if (entry.duration > this.config.longTaskThreshold) {
          totalBlockingTime += entry.duration - this.config.longTaskThreshold;
        }
      });

      this.metrics.totalBlockingTime = {
        value: totalBlockingTime,
        startTime: performance.timing.navigationStart,
        endTime: performance.timing.loadEventEnd,
      };

      this.notifyObservers('totalBlockingTime', this.metrics.totalBlockingTime);
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  // Observe memory usage
  observeMemoryUsage() {
    if (performance.memory) {
      const updateMemoryMetrics = () => {
        this.metrics.memoryUsage = {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), // MB
          timestamp: Date.now(),
        };
        
        if (this.config.enableConsoleOutput) {
          console.log('📊 Memory Usage:', this.metrics.memoryUsage);
        }
        
        this.notifyObservers('memoryUsage', this.metrics.memoryUsage);
      };

      // Update memory metrics every 5 seconds
      setInterval(updateMemoryMetrics, 5000);
      updateMemoryMetrics(); // Initial measurement
    }
  }

  // Observe bundle size
  observeBundleSize() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      let totalBundleSize = 0;
      const bundleFiles = [];

      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalBundleSize += resource.transferSize || 0;
          bundleFiles.push({
            name: resource.name,
            size: resource.transferSize || 0,
            type: resource.name.includes('.js') ? 'javascript' : 'css',
          });
        }
      });

      this.metrics.bundleSize = {
        totalSize: totalBundleSize,
        totalSizeKB: Math.round(totalBundleSize / 1024),
        totalSizeMB: Math.round(totalBundleSize / 1024 / 1024 * 100) / 100,
        files: bundleFiles,
        timestamp: Date.now(),
      };

      if (this.config.enableConsoleOutput) {
        console.log('📦 Bundle Size:', this.metrics.bundleSize);
      }

      this.notifyObservers('bundleSize', this.metrics.bundleSize);
    });
  }

  // Observe route changes (for SPA)
  observeRouteChanges() {
    // Track route changes using popstate and pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      this.routeChangeStartTime = performance.now();
      originalPushState.apply(history, args);
    }.bind(this);

    history.replaceState = function(...args) {
      this.routeChangeStartTime = performance.now();
      originalReplaceState.apply(history, args);
    }.bind(this);

    window.addEventListener('popstate', () => {
      this.routeChangeStartTime = performance.now();
    });

    // Listen for route change completion
    window.addEventListener('load', () => {
      if (this.routeChangeStartTime) {
        const routeChangeTime = performance.now() - this.routeChangeStartTime;
        
        this.metrics.routeChange = {
          duration: Math.round(routeChangeTime),
          timestamp: Date.now(),
        };

        if (this.config.enableConsoleOutput) {
          console.log('🔄 Route Change:', this.metrics.routeChange);
        }

        this.notifyObservers('routeChange', this.metrics.routeChange);
        this.routeChangeStartTime = null;
      }
    });
  }

  // Observe user interactions
  observeUserInteractions() {
    const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const interaction = {
          type: type,
          timestamp: Date.now(),
          target: event.target.tagName,
          targetId: event.target.id || null,
          targetClass: event.target.className || null,
          x: event.clientX || null,
          y: event.clientY || null,
        };

        this.userInteractions.push(interaction);
        
        // Keep only last 50 interactions
        if (this.userInteractions.length > 50) {
          this.userInteractions.shift();
        }

        this.metrics.userInteraction = {
          totalInteractions: this.userInteractions.length,
          recentInteractions: this.userInteractions.slice(-10),
          timestamp: Date.now(),
        };

        if (this.config.enableConsoleOutput) {
          console.log('👆 User Interaction:', interaction);
        }

        this.notifyObservers('userInteraction', interaction);
      }, { passive: true });
    });
  }

  // Setup Core Web Vitals reporting
  setupCoreWebVitalsReporting() {
    window.addEventListener('load', () => {
      // Wait a bit for all metrics to be collected
      setTimeout(() => {
        this.reportCoreWebVitals();
      }, 2000);
    });
  }

  // Report Core Web Vitals to console
  reportCoreWebVitals() {
    const coreWebVitals = {
      // Core Web Vitals
      LCP: this.metrics.largestContentfulPaint ? {
        value: Math.round(this.metrics.largestContentfulPaint.startTime),
        description: 'Largest Contentful Paint - Time for largest content element to render',
        unit: 'ms'
      } : null,
      
      FID: this.metrics.firstInput ? {
        value: Math.round(this.metrics.firstInput.duration),
        description: 'First Input Delay - Time from first user interaction to browser response',
        unit: 'ms'
      } : null,
      
      INP: this.metrics.firstInput ? {
        value: Math.round(this.metrics.firstInput.duration),
        description: 'Interaction to Next Paint - Modern replacement for FID, measures interaction responsiveness',
        unit: 'ms'
      } : null,
      
      CLS: this.metrics.cumulativeLayoutShift ? {
        value: this.metrics.cumulativeLayoutShift.value,
        description: 'Cumulative Layout Shift - Visual stability score',
        unit: 'score'
      } : null,
      
      FCP: this.metrics.firstContentfulPaint ? {
        value: Math.round(this.metrics.firstContentfulPaint.startTime),
        description: 'First Contentful Paint - Time for first content to render',
        unit: 'ms'
      } : null,
      
      TTFB: this.metrics.navigation ? {
        value: Math.round(this.metrics.navigation.firstByte),
        description: 'Time to First Byte - Server response time',
        unit: 'ms'
      } : null,
    };

    // Custom Application Metrics
    const customMetrics = {
      MemoryUsage: this.metrics.memoryUsage ? {
        value: this.metrics.memoryUsage.usedJSHeapSize,
        description: 'JavaScript heap memory usage',
        unit: 'MB'
      } : null,
      
      BundleSize: this.metrics.bundleSize ? {
        value: this.metrics.bundleSize.totalSizeKB,
        description: 'Size of JavaScript bundles',
        unit: 'KB'
      } : null,
      
      RouteChange: this.metrics.routeChange ? {
        value: this.metrics.routeChange.duration,
        description: 'Time for SPA route transitions',
        unit: 'ms'
      } : null,
      
      DOMContentLoaded: this.metrics.navigation ? {
        value: Math.round(this.metrics.navigation.domContentLoaded),
        description: 'Time for DOM to be fully parsed',
        unit: 'ms'
      } : null,
      
      PageLoad: this.metrics.navigation ? {
        value: Math.round(this.metrics.navigation.pageLoad),
        description: 'Complete page load time',
        unit: 'ms'
      } : null,
      
      UserInteraction: this.metrics.userInteraction ? {
        value: this.metrics.userInteraction.totalInteractions,
        description: 'Custom tracking of user interactions (clicks, scrolls, etc.)',
        unit: 'count'
      } : null,
    };

    // Console output with formatting
    console.group('🚀 Performance Metrics Report');
    
    console.group('📈 Core Web Vitals');
    Object.entries(coreWebVitals).forEach(([key, metric]) => {
      if (metric) {
        console.log(`${key}: ${metric.value}${metric.unit} - ${metric.description}`);
      } else {
        console.log(`${key}: Not available`);
      }
    });
    console.groupEnd();
    
    console.group('⚙️ Custom Application Metrics');
    Object.entries(customMetrics).forEach(([key, metric]) => {
      if (metric) {
        console.log(`${key}: ${metric.value}${metric.unit} - ${metric.description}`);
      } else {
        console.log(`${key}: Not available`);
      }
    });
    console.groupEnd();
    
    console.groupEnd();

    // Store the formatted report
    this.metrics.coreWebVitalsReport = {
      coreWebVitals,
      customMetrics,
      timestamp: Date.now(),
    };

    this.notifyObservers('coreWebVitalsReport', this.metrics.coreWebVitalsReport);
  }

  // Add an observer
  addObserver(callback) {
    this.observers.add(callback);
  }

  // Remove an observer
  removeObserver(callback) {
    this.observers.delete(callback);
  }

  // Notify all observers
  notifyObservers(type, data) {
    this.observers.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  // Get all metrics
  getMetrics() {
    return this.metrics;
  }

  // Get specific metric
  getMetric(type) {
    return this.metrics[type];
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = {};
  }

  // Set configuration
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }
}

// Export the performance monitor
export const performanceMonitor = new PerformanceMonitor(); 