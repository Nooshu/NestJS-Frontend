import { performanceMonitor } from './performance-monitor';

/**
 * PerformanceService class for managing and reporting performance metrics.
 * Handles the collection, processing, and reporting of performance data to a backend service.
 * 
 * @class PerformanceService
 */
class PerformanceService {
  /**
   * Creates a new PerformanceService instance.
   * Initializes the service with default configuration values.
   * 
   * @constructor
   */
  constructor() {
    this.metrics = {};
    this.reportingEndpoint = process.env.PERFORMANCE_REPORTING_ENDPOINT || '/api/performance-metrics';
    this.sampleRate = process.env.PERFORMANCE_SAMPLE_RATE || 1.0;
    this.maxEntries = process.env.PERFORMANCE_MAX_ENTRIES || 100;
    this.isReportingEnabled = process.env.NODE_ENV === 'production';
  }

  // Initialize the performance service
  init() {
    if (this.isReportingEnabled && Math.random() < this.sampleRate) {
      performanceMonitor.init();
      this.setupMetricsCollection();
      this.setupPeriodicReporting();
    }
  }

  // Setup metrics collection
  setupMetricsCollection() {
    // Navigation timing
    performanceMonitor.addObserver((type, data) => {
      if (type === 'navigation') {
        this.metrics.navigation = data;
      }
    });

    // Resource timing
    performanceMonitor.addObserver((type, data) => {
      if (type === 'resource') {
        if (!this.metrics.resources) {
          this.metrics.resources = [];
        }
        this.metrics.resources.push(data);
        if (this.metrics.resources.length > this.maxEntries) {
          this.metrics.resources.shift();
        }
      }
    });

    // Long tasks
    performanceMonitor.addObserver((type, data) => {
      if (type === 'longTask') {
        if (!this.metrics.longTasks) {
          this.metrics.longTasks = [];
        }
        this.metrics.longTasks.push(data);
        if (this.metrics.longTasks.length > this.maxEntries) {
          this.metrics.longTasks.shift();
        }
      }
    });

    // Layout shifts
    performanceMonitor.addObserver((type, data) => {
      if (type === 'layoutShift') {
        if (!this.metrics.layoutShifts) {
          this.metrics.layoutShifts = [];
        }
        this.metrics.layoutShifts.push(data);
        if (this.metrics.layoutShifts.length > this.maxEntries) {
          this.metrics.layoutShifts.shift();
        }
      }
    });

    // First input
    performanceMonitor.addObserver((type, data) => {
      if (type === 'firstInput') {
        this.metrics.firstInput = data;
      }
    });

    // Largest contentful paint
    performanceMonitor.addObserver((type, data) => {
      if (type === 'largestContentfulPaint') {
        this.metrics.largestContentfulPaint = data;
      }
    });

    // Cumulative layout shift
    performanceMonitor.addObserver((type, data) => {
      if (type === 'cumulativeLayoutShift') {
        this.metrics.cumulativeLayoutShift = data;
      }
    });

    // First contentful paint
    performanceMonitor.addObserver((type, data) => {
      if (type === 'firstContentfulPaint') {
        this.metrics.firstContentfulPaint = data;
      }
    });

    // Time to interactive
    performanceMonitor.addObserver((type, data) => {
      if (type === 'timeToInteractive') {
        this.metrics.timeToInteractive = data;
      }
    });

    // Total blocking time
    performanceMonitor.addObserver((type, data) => {
      if (type === 'totalBlockingTime') {
        this.metrics.totalBlockingTime = data;
      }
    });
  }

  // Setup periodic reporting
  setupPeriodicReporting() {
    // Report metrics every 5 minutes
    setInterval(() => {
      this.reportMetrics();
    }, 5 * 60 * 1000);

    // Report metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  // Report metrics to the server
  async reportMetrics() {
    if (!this.isReportingEnabled) return;

    try {
      const response = await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (!response.ok) {
        console.error('Failed to report performance metrics:', response.statusText);
      }
    } catch (error) {
      console.error('Error reporting performance metrics:', error);
    }
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

  /**
   * Updates the service configuration with new settings.
   * Allows dynamic modification of reporting endpoint, sample rate, and other parameters.
   * 
   * @method setConfig
   * @public
   * @param {Object} config - Configuration object
   * @param {string} [config.reportingEndpoint] - Endpoint URL for reporting metrics
   * @param {number} [config.sampleRate] - Rate at which to sample metrics (0-1)
   * @param {number} [config.maxEntries] - Maximum number of entries to store
   * @param {boolean} [config.isReportingEnabled] - Whether reporting is enabled
   */
  setConfig(config) {
    this.reportingEndpoint = config.reportingEndpoint || this.reportingEndpoint;
    this.sampleRate = config.sampleRate || this.sampleRate;
    this.maxEntries = config.maxEntries || this.maxEntries;
    this.isReportingEnabled = config.isReportingEnabled ?? this.isReportingEnabled;
  }
}

// Export the performance service
export const performanceService = new PerformanceService(); 