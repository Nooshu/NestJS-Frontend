/**
 * @jest-environment @happy-dom/jest-environment
 */

const mockInit = jest.fn();
const mockAddObserver = jest.fn();

jest.mock('../performance-monitor.js', () => ({
  performanceMonitor: {
    init: (...args: any[]) => mockInit(...args),
    addObserver: (...args: any[]) => mockAddObserver(...args),
  },
}));

describe('PerformanceService', () => {
  let PerformanceService: any;
  let service: any;
  let randomSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    global.fetch = jest.fn();

    // Re-require after mocks

    ({ PerformanceService } = require('../performance-service.js'));
    service = new PerformanceService();
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch {
      // No pending fake timers
    }
    jest.clearAllTimers();
    jest.useRealTimers();
    randomSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('initializes with defaults', () => {
    expect(service.isReportingEnabled).toBe(false);
    expect(service.isMonitoringEnabled).toBe(true);
    expect(service.reportingEndpoint).toBe('/api/performance-metrics');
  });

  it('skips init when monitoring disabled', () => {
    service.setConfig({ isMonitoringEnabled: false });
    service.init();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('skips init when random exceeds sample rate', () => {
    randomSpy.mockReturnValue(0.9);
    service.setConfig({ sampleRate: 0.5 });
    service.init();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('initializes monitor and metrics collection when enabled', () => {
    service.init();
    expect(mockInit).toHaveBeenCalled();
    expect(mockAddObserver).toHaveBeenCalled();
  });

  it('sets up periodic reporting when reporting is enabled', () => {
    const reportSpy = jest.spyOn(service, 'reportMetrics').mockResolvedValue(undefined);
    service.setConfig({ isReportingEnabled: true, isMonitoringEnabled: true });
    randomSpy.mockReturnValue(0);
    service.init();

    jest.advanceTimersByTime(5 * 60 * 1000);
    expect(reportSpy).toHaveBeenCalled();

    reportSpy.mockClear();
    window.dispatchEvent(new Event('beforeunload'));
    expect(reportSpy).toHaveBeenCalled();
  });

  it('collects all metric types via observers', () => {
    const handlers: Array<(type: string, data: any) => void> = [];
    mockAddObserver.mockImplementation((cb: any) => handlers.push(cb));
    service.setupMetricsCollection();

    expect(handlers).toHaveLength(10);

    handlers.forEach((h) => h('other', { ignored: true }));
    expect(service.metrics).toEqual({});

    handlers[0]('navigation', { pageLoad: 1 });
    expect(service.metrics.navigation).toEqual({ pageLoad: 1 });

    handlers[1]('resource', { name: 'a.js' });
    handlers[1]('resource', { name: 'b.js' });
    expect(service.metrics.resources).toHaveLength(2);

    service.maxEntries = 1;
    service.metrics.resources = [];
    handlers[1]('resource', { name: 'c.js' });
    handlers[1]('resource', { name: 'd.js' });
    expect(service.metrics.resources).toEqual([{ name: 'd.js' }]);

    service.metrics.longTasks = undefined;
    service.metrics.layoutShifts = undefined;
    handlers[2]('longTask', { duration: 60 });
    handlers[2]('longTask', { duration: 70 });
    expect(service.metrics.longTasks).toEqual([{ duration: 70 }]);

    handlers[3]('layoutShift', { value: 0.1 });
    handlers[3]('layoutShift', { value: 0.2 });
    expect(service.metrics.layoutShifts).toEqual([{ value: 0.2 }]);

    handlers[4]('firstInput', { duration: 5 });
    handlers[5]('largestContentfulPaint', { startTime: 100 });
    handlers[6]('cumulativeLayoutShift', { value: 0.01 });
    handlers[7]('firstContentfulPaint', { startTime: 50 });
    handlers[8]('timeToInteractive', { value: 120 });
    handlers[9]('totalBlockingTime', { value: 30 });

    expect(service.metrics.firstInput).toEqual({ duration: 5 });
    expect(service.metrics.largestContentfulPaint).toEqual({ startTime: 100 });
    expect(service.metrics.cumulativeLayoutShift).toEqual({ value: 0.01 });
    expect(service.metrics.firstContentfulPaint).toEqual({ startTime: 50 });
    expect(service.metrics.timeToInteractive).toEqual({ value: 120 });
    expect(service.metrics.totalBlockingTime).toEqual({ value: 30 });
  });

  it('returns early from reportMetrics when reporting disabled', async () => {
    await service.reportMetrics();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reports metrics successfully', async () => {
    service.setConfig({ isReportingEnabled: true });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    await service.reportMetrics();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/performance-metrics',
      expect.objectContaining({ method: 'POST' })
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs when report response is not ok', async () => {
    service.setConfig({ isReportingEnabled: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
    });
    await service.reportMetrics();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to report performance metrics:',
      'Bad Gateway'
    );
  });

  it('logs when report fetch throws', async () => {
    service.setConfig({ isReportingEnabled: true });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));
    await service.reportMetrics();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error reporting performance metrics:',
      expect.any(Error)
    );
  });

  it('getters, clearMetrics, and setConfig cover fallbacks', () => {
    service.metrics = { navigation: { pageLoad: 1 } };
    expect(service.getMetrics()).toEqual({ navigation: { pageLoad: 1 } });
    expect(service.getMetric('navigation')).toEqual({ pageLoad: 1 });
    service.clearMetrics();
    expect(service.getMetrics()).toEqual({});

    service.setConfig({
      reportingEndpoint: '/custom',
      sampleRate: 0.25,
      maxEntries: 10,
      isReportingEnabled: true,
      isMonitoringEnabled: false,
    });
    expect(service.reportingEndpoint).toBe('/custom');
    expect(service.sampleRate).toBe(0.25);
    expect(service.maxEntries).toBe(10);
    expect(service.isReportingEnabled).toBe(true);
    expect(service.isMonitoringEnabled).toBe(false);

    // Falsy fallbacks for endpoint/sample/max; nullish coalescing for flags
    service.setConfig({
      reportingEndpoint: '',
      sampleRate: 0,
      maxEntries: 0,
      isReportingEnabled: undefined,
      isMonitoringEnabled: undefined,
    } as any);
    expect(service.reportingEndpoint).toBe('/custom');
    expect(service.sampleRate).toBe(0.25);
    expect(service.maxEntries).toBe(10);
    expect(service.isReportingEnabled).toBe(true);
    expect(service.isMonitoringEnabled).toBe(false);
  });
});
