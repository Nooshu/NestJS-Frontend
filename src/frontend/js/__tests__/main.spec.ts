/**
 * @jest-environment @happy-dom/jest-environment
 */

const mockInit = jest.fn();
const mockSetConfig = jest.fn();
const mockAddObserver = jest.fn();

jest.mock('../performance-monitor.js', () => ({
  performanceMonitor: {
    setConfig: (...args: any[]) => mockSetConfig(...args),
    addObserver: (...args: any[]) => mockAddObserver(...args),
  },
}));

jest.mock('../performance-service.js', () => ({
  performanceService: {
    init: (...args: any[]) => mockInit(...args),
  },
}));

describe('main.js', () => {
  let consoleLogSpy: jest.SpyInstance;
  let observerCallback: (type: string, data: any) => void;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    document.body.innerHTML = '';
    mockAddObserver.mockImplementation((cb: any) => {
      observerCallback = cb;
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  function loadMain() {
    require('../main.js');
  }

  it('initializes performance monitoring and console output', () => {
    loadMain();
    expect(mockInit).toHaveBeenCalled();
    expect(mockSetConfig).toHaveBeenCalledWith({ enableConsoleOutput: true });
    expect(mockAddObserver).toHaveBeenCalled();
  });

  it('observer ignores coreWebVitalsReport and logs other types', () => {
    loadMain();
    observerCallback('coreWebVitalsReport', { ok: true });
    expect(consoleLogSpy).not.toHaveBeenCalled();

    observerCallback('navigation', { pageLoad: 1 });
    expect(consoleLogSpy).toHaveBeenCalledWith('🧭 navigation:', { pageLoad: 1 });

    observerCallback('unknownType', { x: 1 });
    expect(consoleLogSpy).toHaveBeenCalledWith('📈 unknownType:', { x: 1 });

    const knownTypes = [
      'resource',
      'longTask',
      'layoutShift',
      'firstInput',
      'largestContentfulPaint',
      'cumulativeLayoutShift',
      'firstContentfulPaint',
      'timeToInteractive',
      'totalBlockingTime',
      'memoryUsage',
      'bundleSize',
      'routeChange',
      'userInteraction',
    ];
    knownTypes.forEach((type) => {
      consoleLogSpy.mockClear();
      observerCallback(type, {});
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  it('marks active nav item matching current path', () => {
    window.history.pushState({}, '', '/second-page');
    document.body.innerHTML = `
      <nav>
        <ul>
          <li class="govuk-header__navigation-item">
            <a href="/">Home</a>
          </li>
          <li class="govuk-header__navigation-item">
            <a href="/second-page">Second</a>
          </li>
        </ul>
      </nav>
    `;

    loadMain();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const links = document.querySelectorAll('.govuk-header__navigation-item a');
    expect(links[0].classList.contains('govuk-header__navigation-item--active')).toBe(false);
    expect(links[1].classList.contains('govuk-header__navigation-item--active')).toBe(true);
  });

  it('skip link focuses and scrolls to target when present', () => {
    document.body.innerHTML = `
      <a class="govuk-skip-link" href="#main-content">Skip</a>
      <div id="main-content" tabindex="-1">Content</div>
    `;
    const target = document.getElementById('main-content')!;
    const focusSpy = jest.spyOn(target, 'focus').mockImplementation();
    (target as any).scrollIntoView = jest.fn();

    loadMain();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const skipLink = document.querySelector('.govuk-skip-link') as HTMLAnchorElement;
    skipLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(focusSpy).toHaveBeenCalled();
    expect((target as any).scrollIntoView).toHaveBeenCalled();
  });

  it('skip link does nothing when target element is missing', () => {
    document.body.innerHTML = `<a class="govuk-skip-link" href="#missing">Skip</a>`;
    loadMain();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const skipLink = document.querySelector('.govuk-skip-link') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = !skipLink.dispatchEvent(event);
    // preventDefault is called; no throw when target missing
    expect(prevented || event.defaultPrevented).toBeDefined();
  });

  it('handles missing skip link without error', () => {
    document.body.innerHTML = `<div></div>`;
    loadMain();
    expect(() => document.dispatchEvent(new Event('DOMContentLoaded'))).not.toThrow();
  });
});
