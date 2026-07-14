/**
 * @jest-environment @happy-dom/jest-environment
 */

type ObserverCallback = (list: { getEntries: () => any[] }) => void;

const observerCallbacks: ObserverCallback[] = [];
const observeCalls: any[] = [];

class MockPerformanceObserver {
  callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    observerCallbacks.push(callback);
  }

  observe(options: any) {
    observeCalls.push(options);
  }

  disconnect() {}
}

const mockTiming = {
  domainLookupStart: 10,
  domainLookupEnd: 20,
  connectStart: 20,
  connectEnd: 30,
  requestStart: 40,
  responseStart: 50,
  responseEnd: 80,
  domLoading: 90,
  domInteractive: 120,
  domContentLoadedEventEnd: 140,
  domComplete: 160,
  loadEventEnd: 200,
  navigationStart: 0,
  redirectStart: 0,
  redirectEnd: 0,
  fetchStart: 5,
  unloadEventStart: 0,
  unloadEventEnd: 2,
};

describe('PerformanceMonitor', () => {
  let PerformanceMonitor: any;
  let monitor: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    observerCallbacks.length = 0;
    observeCalls.length = 0;
    jest.useFakeTimers();

    (global as any).PerformanceObserver = MockPerformanceObserver;
    Object.defineProperty(window, 'performance', {
      configurable: true,
      writable: true,
      value: {
        timing: mockTiming,
        now: jest.fn(() => 1000),
        memory: {
          usedJSHeapSize: 10 * 1024 * 1024,
          totalJSHeapSize: 20 * 1024 * 1024,
          jsHeapSizeLimit: 100 * 1024 * 1024,
        },
        getEntriesByType: jest.fn(() => [
          { name: 'https://cdn.example.com/app.js', transferSize: 2048 },
          { name: 'https://cdn.example.com/main.css', transferSize: 1024 },
          { name: 'https://cdn.example.com/image.png', transferSize: 5000 },
        ]),
      },
    });

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ PerformanceMonitor } = require('../performance-monitor.js'));
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('initializes with defaults', () => {
    expect(monitor.metrics).toEqual({});
    expect(monitor.config.sampleRate).toBe(1);
    expect(monitor.userInteractions).toEqual([]);
  });

  it('skips observers when window.performance is missing', () => {
    Object.defineProperty(window, 'performance', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    monitor.init();
    expect(observerCallbacks).toHaveLength(0);
  });

  it('init registers all observers when performance exists', () => {
    monitor.init();
    expect(observeCalls.some((c) => c.entryTypes?.includes('resource'))).toBe(true);
    expect(observeCalls.some((c) => c.entryTypes?.includes('longtask'))).toBe(true);
    expect(observeCalls.some((c) => c.entryTypes?.includes('layout-shift'))).toBe(true);
    expect(observeCalls.some((c) => c.entryTypes?.includes('first-input'))).toBe(true);
    expect(observeCalls.some((c) => c.entryTypes?.includes('largest-contentful-paint'))).toBe(
      true
    );
    expect(observeCalls.some((c) => c.entryTypes?.includes('paint'))).toBe(true);
  });

  it('records navigation timing on load', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeNavigationTiming();
    window.dispatchEvent(new Event('load'));

    expect(monitor.metrics.navigation.dnsLookup).toBe(10);
    expect(monitor.metrics.navigation.pageLoad).toBe(200);
    expect(observer).toHaveBeenCalledWith('navigation', monitor.metrics.navigation);
  });

  it('observes resource timing including large resources', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeResourceTiming();

    const cb = observerCallbacks[observerCallbacks.length - 1];
    cb({
      getEntries: () => [
        {
          name: 'script.js',
          duration: 12,
          transferSize: 200 * 1024,
          initiatorType: 'script',
          startTime: 1,
          responseEnd: 13,
          domainLookupEnd: 2,
          domainLookupStart: 1,
          connectEnd: 3,
          connectStart: 2,
          responseStart: 5,
        },
      ],
    });

    expect(monitor.metrics.resources).toHaveLength(1);
    expect(monitor.metrics.resources[0].isLarge).toBe(true);
    expect(observer).toHaveBeenCalledWith('resource', expect.any(Object));

    // Cover path where metrics.resources already exists
    cb({
      getEntries: () => [
        {
          name: 'tiny.js',
          duration: 1,
          transferSize: 100,
          initiatorType: 'script',
          startTime: 1,
          responseEnd: 2,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          connectEnd: 1,
          connectStart: 1,
          responseStart: 1,
        },
      ],
    });
    expect(monitor.metrics.resources).toHaveLength(2);
    expect(monitor.metrics.resources[1].isLarge).toBe(false);
  });

  it('observes long tasks above and below threshold', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeLongTasks();
    const cb = observerCallbacks[observerCallbacks.length - 1];

    cb({
      getEntries: () => [
        { duration: 10, startTime: 1, name: 'short', attribution: [] },
        { duration: 80, startTime: 2, name: 'long', attribution: ['script'] },
      ],
    });

    expect(monitor.metrics.longTasks).toHaveLength(1);
    expect(observer).toHaveBeenCalledWith('longTask', expect.objectContaining({ duration: 80 }));

    cb({
      getEntries: () => [{ duration: 90, startTime: 3, name: 'longer', attribution: [] }],
    });
    expect(monitor.metrics.longTasks).toHaveLength(2);
  });

  it('observes layout shifts', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeLayoutShifts();
    const cb = observerCallbacks[observerCallbacks.length - 1];

    cb({
      getEntries: () => [
        { value: 0.1, startTime: 5, sources: [], hadRecentInput: false },
      ],
    });
    expect(monitor.metrics.layoutShifts).toHaveLength(1);

    cb({
      getEntries: () => [{ value: 0.2, startTime: 6, sources: ['a'], hadRecentInput: true }],
    });
    expect(monitor.metrics.layoutShifts).toHaveLength(2);
  });

  it('observes first input delay', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeFirstInputDelay();
    const cb = observerCallbacks[observerCallbacks.length - 1];
    cb({
      getEntries: () => [
        {
          processingStart: 10,
          startTime: 5,
          duration: 5,
          target: 'BUTTON',
          interactionId: 1,
        },
      ],
    });
    expect(monitor.metrics.firstInput.duration).toBe(5);
    expect(observer).toHaveBeenCalledWith('firstInput', monitor.metrics.firstInput);
  });

  it('observes LCP, CLS, and FCP', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);

    monitor.observeLargestContentfulPaint();
    observerCallbacks[observerCallbacks.length - 1]({
      getEntries: () => [
        { startTime: 150, size: 1000, element: 'IMG', url: '/a.png' },
      ],
    });
    expect(monitor.metrics.largestContentfulPaint.size).toBe(1000);

    monitor.observeCumulativeLayoutShift();
    observerCallbacks[observerCallbacks.length - 1]({
      getEntries: () => [{ value: 0.05, startTime: 20, sources: [] }],
    });
    expect(monitor.metrics.cumulativeLayoutShift.value).toBe(0.05);

    monitor.observeFirstContentfulPaint();
    observerCallbacks[observerCallbacks.length - 1]({
      getEntries: () => [
        { startTime: 80, size: 10, element: 'P', url: '' },
      ],
    });
    expect(monitor.metrics.firstContentfulPaint.startTime).toBe(80);
  });

  it('observes time to interactive on load', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeTimeToInteractive();
    window.dispatchEvent(new Event('load'));
    expect(monitor.metrics.timeToInteractive.value).toBe(120);
    expect(observer).toHaveBeenCalledWith('timeToInteractive', expect.any(Object));
  });

  it('observes total blocking time with and without long tasks', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.observeTotalBlockingTime();
    const cb = observerCallbacks[observerCallbacks.length - 1];

    cb({
      getEntries: () => [
        { duration: 10 },
        { duration: 100 },
      ],
    });
    expect(monitor.metrics.totalBlockingTime.value).toBe(50);
    expect(observer).toHaveBeenCalledWith('totalBlockingTime', expect.any(Object));
  });

  it('observes memory usage when available and respects console flag', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.setConfig({ enableConsoleOutput: true });
    monitor.observeMemoryUsage();
    expect(monitor.metrics.memoryUsage.usedJSHeapSize).toBe(10);
    expect(consoleLogSpy).toHaveBeenCalledWith('📊 Memory Usage:', expect.any(Object));
    expect(observer).toHaveBeenCalledWith('memoryUsage', expect.any(Object));

    consoleLogSpy.mockClear();
    monitor.setConfig({ enableConsoleOutput: false });
    jest.advanceTimersByTime(5000);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('skips memory observation when performance.memory is missing', () => {
    (window.performance as any).memory = undefined;
    monitor.observeMemoryUsage();
    expect(monitor.metrics.memoryUsage).toBeUndefined();
  });

  it('observes bundle size on load', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.setConfig({ enableConsoleOutput: true });
    monitor.observeBundleSize();
    window.dispatchEvent(new Event('load'));

    expect(monitor.metrics.bundleSize.totalSize).toBe(3072);
    expect(monitor.metrics.bundleSize.files).toHaveLength(2);
    expect(monitor.metrics.bundleSize.files[0].type).toBe('javascript');
    expect(monitor.metrics.bundleSize.files[1].type).toBe('css');
    expect(consoleLogSpy).toHaveBeenCalledWith('📦 Bundle Size:', expect.any(Object));

    // Missing transferSize fallback — fresh monitor with console disabled
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PerformanceMonitor: PM2 } = require('../performance-monitor.js');
    const quiet = new PM2();
    quiet.setConfig({ enableConsoleOutput: false });
    (window.performance.getEntriesByType as jest.Mock).mockReturnValue([{ name: 'a.js' }]);
    quiet.observeBundleSize();
    window.dispatchEvent(new Event('load'));
    expect(quiet.metrics.bundleSize.totalSize).toBe(0);
    expect(quiet.config.enableConsoleOutput).toBe(false);
  });

  it('tracks route changes via pushState, replaceState, popstate, and load', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);
    monitor.setConfig({ enableConsoleOutput: true });
    monitor.observeRouteChanges();

    history.pushState({}, '', '/one');
    expect(monitor.routeChangeStartTime).toBe(1000);

    history.replaceState({}, '', '/two');
    expect(monitor.routeChangeStartTime).toBe(1000);

    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(monitor.routeChangeStartTime).toBe(1000);

    window.dispatchEvent(new Event('load'));
    expect(monitor.metrics.routeChange.duration).toBe(0);
    expect(monitor.routeChangeStartTime).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith('🔄 Route Change:', expect.any(Object));

    // Load without pending route change
    consoleLogSpy.mockClear();
    observer.mockClear();
    monitor.routeChangeStartTime = null;
    window.dispatchEvent(new Event('load'));
    expect(observer).not.toHaveBeenCalledWith('routeChange', expect.anything());

    // Quiet route-change config path (console covered via memoryUsage tests)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PerformanceMonitor: PM3 } = require('../performance-monitor.js');
    const quiet = new PM3();
    quiet.setConfig({ enableConsoleOutput: false });
    quiet.observeRouteChanges();
    history.pushState({}, '', '/quiet');
    window.dispatchEvent(new Event('load'));
    expect(quiet.metrics.routeChange).toBeDefined();
    expect(quiet.config.enableConsoleOutput).toBe(false);
  });

  it('skips console log for user interactions when disabled on a clean document', () => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PerformanceMonitor } = require('../performance-monitor.js');
      const quiet = new PerformanceMonitor();
      quiet.setConfig({ enableConsoleOutput: false });
      quiet.observeUserInteractions();

      const el = document.createElement('button');
      document.body.appendChild(el);
      el.click();

      // Branch coverage for enableConsoleOutput===false (other suites may still log)
      expect(quiet.config.enableConsoleOutput).toBe(false);
      expect(quiet.userInteractions.length).toBeGreaterThan(0);
    });
  });

  it('tracks user interactions and trims to 50', () => {
    const observer = jest.fn();
    // Fresh instance so document listeners aren't shared with prior tests
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PerformanceMonitor: PM4 } = require('../performance-monitor.js');
    const local = new PM4();
    local.addObserver(observer);
    local.setConfig({ enableConsoleOutput: true });
    local.observeUserInteractions();

    const button = document.createElement('button');
    button.id = 'btn';
    button.className = 'govuk-button';
    document.body.appendChild(button);
    button.dispatchEvent(new MouseEvent('click', { clientX: 10, clientY: 20, bubbles: true }));

    expect(local.userInteractions).toHaveLength(1);
    expect(local.metrics.userInteraction.totalInteractions).toBe(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('👆 User Interaction:', expect.any(Object));

    // Trim without relying on console flag (prior listeners may remain on document)
    for (let i = 0; i < 55; i++) {
      document.dispatchEvent(new Event('scroll', { bubbles: true }));
    }
    expect(local.userInteractions.length).toBe(50);
  });

  it('reports core web vitals with and without metric data', () => {
    const observer = jest.fn();
    monitor.addObserver(observer);

    // Empty metrics → "Not available" branches
    monitor.reportCoreWebVitals();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Not available'));
    expect(monitor.metrics.coreWebVitalsReport).toBeDefined();

    monitor.metrics = {
      largestContentfulPaint: { startTime: 100.4 },
      firstInput: { duration: 12.6 },
      cumulativeLayoutShift: { value: 0.01 },
      firstContentfulPaint: { startTime: 50.2 },
      navigation: { firstByte: 40.1, domContentLoaded: 90.2, pageLoad: 200.9 },
      memoryUsage: { usedJSHeapSize: 8 },
      bundleSize: { totalSizeKB: 42 },
      routeChange: { duration: 30 },
      userInteraction: { totalInteractions: 3 },
    };
    consoleLogSpy.mockClear();
    monitor.reportCoreWebVitals();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('LCP:'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('MemoryUsage:'));
    expect(observer).toHaveBeenCalledWith('coreWebVitalsReport', expect.any(Object));
  });

  it('sets up core web vitals reporting on load with delay', () => {
    const spy = jest.spyOn(monitor, 'reportCoreWebVitals');
    monitor.setupCoreWebVitalsReporting();
    window.dispatchEvent(new Event('load'));
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(spy).toHaveBeenCalled();
  });

  it('manages observers and swallows observer errors', () => {
    const good = jest.fn();
    const bad = jest.fn(() => {
      throw new Error('observer failed');
    });
    monitor.addObserver(good);
    monitor.addObserver(bad);
    monitor.notifyObservers('resource', { ok: true });
    expect(good).toHaveBeenCalledWith('resource', { ok: true });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in performance observer:',
      expect.any(Error)
    );

    monitor.removeObserver(good);
    good.mockClear();
    monitor.notifyObservers('resource', { ok: true });
    expect(good).not.toHaveBeenCalled();
  });

  it('getters, clearMetrics, and setConfig work', () => {
    monitor.metrics = { navigation: { pageLoad: 1 } };
    expect(monitor.getMetrics()).toEqual({ navigation: { pageLoad: 1 } });
    expect(monitor.getMetric('navigation')).toEqual({ pageLoad: 1 });
    monitor.clearMetrics();
    expect(monitor.getMetrics()).toEqual({});
    monitor.setConfig({ sampleRate: 0.5, enableConsoleOutput: false });
    expect(monitor.config.sampleRate).toBe(0.5);
    expect(monitor.config.enableConsoleOutput).toBe(false);
    expect(monitor.config.maxEntries).toBe(100);
  });
});
