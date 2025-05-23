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
    };
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