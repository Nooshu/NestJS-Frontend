// Import GOV.UK Frontend
import { initAll } from 'govuk-frontend';
import { performanceMonitor } from './performance-monitor';
import { performanceService } from './performance-service';

// Initialize GOV.UK Frontend components
initAll();

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  performanceService.init();
  
  // Example: Log performance metrics to console
  performanceMonitor.addObserver((type, data) => {
    console.log(`Performance metric - ${type}:`, data);
  });
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

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

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Example: Basic performance monitoring
  window.addEventListener('load', () => {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    
    // Log performance metrics
    console.log('Page load time:', loadTime);
    
    // You could send this to your analytics service
    // sendToAnalytics({ loadTime });
  });
} 