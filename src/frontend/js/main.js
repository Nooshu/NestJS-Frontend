/**
 * Browser entry script loaded by layout.njk after GOV.UK Frontend.
 *
 * Purpose: start client performance monitoring and small progressive
 * enhancements (nav active state, skip-link focus). Component init is owned by
 * `window.GOVUKFrontend.initAll()` in the layout — do not re-init macros here.
 *
 * Side effects: observers log Core Web Vitals / timings to the console when
 * console output is enabled. Prefer PerformanceMonitor / PerformanceService APIs
 * for new metrics rather than ad-hoc timers.
 */
import { performanceMonitor } from './performance-monitor.js';
import { performanceService } from './performance-service.js';

// Initialize GOV.UK Frontend components (already loaded via script tag)
// The initAll() is called in the HTML template

// Initialize performance monitoring
// Enable performance monitoring in all environments for development and testing
performanceService.init();

// Enable console output for all performance metrics
performanceMonitor.setConfig({ enableConsoleOutput: true });

// Log performance metrics to console with enhanced formatting
performanceMonitor.addObserver((type, data) => {
  if (type === 'coreWebVitalsReport') {
    // The reportCoreWebVitals method already handles console output
    return;
  }
  
  // Log individual metrics as they come in
  const emoji = {
    navigation: '🧭',
    resource: '📁',
    longTask: '⏱️',
    layoutShift: '📐',
    firstInput: '👆',
    largestContentfulPaint: '🎨',
    cumulativeLayoutShift: '📊',
    firstContentfulPaint: '🎯',
    timeToInteractive: '⚡',
    totalBlockingTime: '🚫',
    memoryUsage: '💾',
    bundleSize: '📦',
    routeChange: '🔄',
    userInteraction: '👆'
  };
  
  console.log(`${emoji[type] || '📈'} ${type}:`, data);
});

// Service Worker registration removed - not needed for performance monitoring

// Custom JavaScript functionality
document.addEventListener('DOMContentLoaded', () => {
  // Example: Add active state to current navigation item
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.govuk-header__navigation-item a');
  
  navItems.forEach(item => {
    if (item.getAttribute('href') === currentPath) {
      item.classList.add('govuk-header__navigation-item--active');
    }
  });

  // Example: Add skip link functionality
  const skipLink = document.querySelector('.govuk-skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = skipLink.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView();
      }
    });
  }
});

// Performance monitoring is now handled by the enhanced PerformanceMonitor class above 