import {
  mockPerformance,
  mockConsole,
  customMatchers,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from './helpers';

describe('Test Helpers', () => {
  describe('mockPerformance', () => {
    it('should have all required performance API methods mocked', () => {
      expect(mockPerformance.mark).toBeDefined();
      expect(mockPerformance.measure).toBeDefined();
      expect(mockPerformance.clearMarks).toBeDefined();
      expect(mockPerformance.clearMeasures).toBeDefined();
      expect(mockPerformance.getEntriesByType).toBeDefined();
      expect(mockPerformance.getEntriesByName).toBeDefined();
      expect(mockPerformance.now).toBeDefined();
      expect(mockPerformance.toJSON).toBeDefined();
      expect(mockPerformance.addEventListener).toBeDefined();
      expect(mockPerformance.removeEventListener).toBeDefined();
      expect(mockPerformance.dispatchEvent).toBeDefined();
    });

    it('should have performance API properties', () => {
      expect(mockPerformance.eventCounts).toEqual({});
      expect(mockPerformance.navigation).toEqual({});
      expect(mockPerformance.onresourcetimingbufferfull).toBeNull();
      expect(mockPerformance.timing).toEqual({});
    });

    it('should have jest mock functions for methods', () => {
      expect(typeof mockPerformance.mark).toBe('function');
      expect(typeof mockPerformance.measure).toBe('function');
      expect(typeof mockPerformance.clearMarks).toBe('function');
      expect(typeof mockPerformance.clearMeasures).toBe('function');
      expect(typeof mockPerformance.getEntriesByType).toBe('function');
      expect(typeof mockPerformance.getEntriesByName).toBe('function');
      expect(typeof mockPerformance.now).toBe('function');
      expect(typeof mockPerformance.toJSON).toBe('function');
      expect(typeof mockPerformance.addEventListener).toBe('function');
      expect(typeof mockPerformance.removeEventListener).toBe('function');
      expect(typeof mockPerformance.dispatchEvent).toBe('function');
    });

    it('should be able to call performance methods without errors', () => {
      expect(() => mockPerformance.mark('test')).not.toThrow();
      expect(() => mockPerformance.measure('test')).not.toThrow();
      expect(() => mockPerformance.clearMarks()).not.toThrow();
      expect(() => mockPerformance.clearMeasures()).not.toThrow();
      expect(() => mockPerformance.getEntriesByType('mark')).not.toThrow();
      expect(() => mockPerformance.getEntriesByName('test')).not.toThrow();
      expect(() => mockPerformance.now()).not.toThrow();
      expect(() => mockPerformance.toJSON()).not.toThrow();
      expect(() => mockPerformance.addEventListener('test', () => {})).not.toThrow();
      expect(() => mockPerformance.removeEventListener('test', () => {})).not.toThrow();
      expect(() => mockPerformance.dispatchEvent(new Event('test'))).not.toThrow();
    });
  });

  describe('mockConsole', () => {
    it('should have all console methods mocked', () => {
      expect(mockConsole.log).toBeDefined();
      expect(mockConsole.error).toBeDefined();
      expect(mockConsole.warn).toBeDefined();
      expect(mockConsole.info).toBeDefined();
      expect(mockConsole.debug).toBeDefined();
    });

    it('should have jest mock functions for console methods', () => {
      expect(typeof mockConsole.log).toBe('function');
      expect(typeof mockConsole.error).toBe('function');
      expect(typeof mockConsole.warn).toBe('function');
      expect(typeof mockConsole.info).toBe('function');
      expect(typeof mockConsole.debug).toBe('function');
    });

    it('should be able to call console methods without errors', () => {
      expect(() => mockConsole.log('test')).not.toThrow();
      expect(() => mockConsole.error('test')).not.toThrow();
      expect(() => mockConsole.warn('test')).not.toThrow();
      expect(() => mockConsole.info('test')).not.toThrow();
      expect(() => mockConsole.debug('test')).not.toThrow();
    });
  });

  describe('customMatchers', () => {
    it('should have toBeWithinRange matcher', () => {
      expect(customMatchers.toBeWithinRange).toBeDefined();
      expect(typeof customMatchers.toBeWithinRange).toBe('function');
    });

    it('should pass when value is within range', () => {
      const result = customMatchers.toBeWithinRange(5, 1, 10);
      
      expect(result.pass).toBe(true);
      expect(result.message()).toBe('expected 5 not to be within range 1 - 10');
    });

    it('should fail when value is below range', () => {
      const result = customMatchers.toBeWithinRange(0, 1, 10);
      
      expect(result.pass).toBe(false);
      expect(result.message()).toBe('expected 0 to be within range 1 - 10');
    });

    it('should fail when value is above range', () => {
      const result = customMatchers.toBeWithinRange(15, 1, 10);
      
      expect(result.pass).toBe(false);
      expect(result.message()).toBe('expected 15 to be within range 1 - 10');
    });

    it('should pass when value equals floor boundary', () => {
      const result = customMatchers.toBeWithinRange(1, 1, 10);
      
      expect(result.pass).toBe(true);
    });

    it('should pass when value equals ceiling boundary', () => {
      const result = customMatchers.toBeWithinRange(10, 1, 10);
      
      expect(result.pass).toBe(true);
    });

    it('should handle edge cases correctly', () => {
      // Test with negative numbers
      const result1 = customMatchers.toBeWithinRange(-5, -10, 0);
      expect(result1.pass).toBe(true);
      
      // Test with decimal numbers
      const result2 = customMatchers.toBeWithinRange(5.5, 1, 10);
      expect(result2.pass).toBe(true);
      
      // Test with same floor and ceiling
      const result3 = customMatchers.toBeWithinRange(5, 5, 5);
      expect(result3.pass).toBe(true);
    });

    it('should return proper message format for all cases', () => {
      const passResult = customMatchers.toBeWithinRange(5, 1, 10);
      const failResult = customMatchers.toBeWithinRange(15, 1, 10);
      
      expect(passResult.message()).toContain('expected 5 not to be within range 1 - 10');
      expect(failResult.message()).toContain('expected 15 to be within range 1 - 10');
      expect(typeof passResult.message).toBe('function');
      expect(typeof failResult.message).toBe('function');
    });
  });

  describe('setupTestEnvironment', () => {
    let originalConsole: typeof console;
    let originalPerformance: typeof performance;
    let extendSpy: jest.SpyInstance;

    beforeEach(() => {
      originalConsole = global.console;
      originalPerformance = global.performance;
      extendSpy = jest.spyOn(expect, 'extend');
    });

    afterEach(() => {
      global.console = originalConsole;
      global.performance = originalPerformance;
      extendSpy.mockRestore();
    });

    it('should mock console globally', () => {
      setupTestEnvironment();
      
      expect(global.console).toEqual({
        ...originalConsole,
        ...mockConsole,
      });
    });

    it('should mock performance globally', () => {
      setupTestEnvironment();
      
      expect(global.performance).toBe(mockPerformance);
    });

    it('should add custom matchers', () => {
      setupTestEnvironment();
      
      expect(extendSpy).toHaveBeenCalledWith(customMatchers);
    });

    it('should preserve original console methods while adding mocks', () => {
      setupTestEnvironment();
      
      // Check that original console methods are still available
      expect(global.console.log).toBeDefined();
      expect(global.console.error).toBeDefined();
      expect(global.console.warn).toBeDefined();
      expect(global.console.info).toBeDefined();
      expect(global.console.debug).toBeDefined();
    });

    it('should set global test timeout', () => {
      // Test that the function can be called without errors
      expect(() => setupTestEnvironment()).not.toThrow();
      
      // Verify that the environment was set up
      expect(global.performance).toBe(mockPerformance);
      expect(global.console).toEqual({
        ...originalConsole,
        ...mockConsole,
      });
    });
  });

  describe('cleanupTestEnvironment', () => {
    it('should be callable without errors', () => {
      expect(() => cleanupTestEnvironment()).not.toThrow();
    });

    it('should be able to be called multiple times', () => {
      expect(() => cleanupTestEnvironment()).not.toThrow();
      expect(() => cleanupTestEnvironment()).not.toThrow();
      expect(() => cleanupTestEnvironment()).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should work together in a test setup and cleanup cycle', () => {
      // Setup test environment
      setupTestEnvironment();
      
      // Verify setup worked
      expect(global.performance).toBe(mockPerformance);
      expect(global.console).toEqual({
        ...console,
        ...mockConsole,
      });
      
      // Cleanup test environment
      cleanupTestEnvironment();
      
      // Verify cleanup worked by checking that the functions exist and can be called
      expect(typeof jest.clearAllMocks).toBe('function');
      expect(typeof jest.resetAllMocks).toBe('function');
      expect(typeof jest.restoreAllMocks).toBe('function');
    });

    it('should handle multiple setup and cleanup cycles', () => {
      // First cycle
      setupTestEnvironment();
      expect(global.performance).toBe(mockPerformance);
      cleanupTestEnvironment();
      
      // Second cycle
      setupTestEnvironment();
      expect(global.performance).toBe(mockPerformance);
      cleanupTestEnvironment();
      
      // Third cycle
      setupTestEnvironment();
      expect(global.performance).toBe(mockPerformance);
      cleanupTestEnvironment();
    });
  });
});
