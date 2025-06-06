import { apiConfig } from './api.config';

// Define the type for our config object
type ApiConfig = typeof apiConfig;

describe('apiConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear all relevant environment variables
    delete process.env.API_BASE_URL;
    delete process.env.API_TIMEOUT;
    delete process.env.API_RETRY_ATTEMPTS;
    delete process.env.API_CACHE_ENABLED;
    delete process.env.API_CACHE_TTL;
  });

  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  describe('default values', () => {
    it('should have correct default baseUrl', () => {
      expect(apiConfig.baseUrl).toBe('http://your-java-api.com');
    });

    it('should have correct default timeout', () => {
      expect(apiConfig.timeout).toBe(30000);
    });

    it('should have correct default retryAttempts', () => {
      expect(apiConfig.retryAttempts).toBe(3);
    });

    it('should have correct default caching settings', () => {
      expect(apiConfig.caching.enabled).toBe(true);
      expect(apiConfig.caching.ttl).toBe(300000);
    });
  });

  describe('custom environment variables', () => {
    const getConfigWithEnv = (env: Record<string, string>): ApiConfig => {
      const originalEnv = { ...process.env };
      Object.assign(process.env, env);
      let config: ApiConfig;
      jest.isolateModules(() => {
        config = require('./api.config').apiConfig;
      });
      process.env = originalEnv;
      return config!; // We know this will be defined because we just set it
    };

    it('should use custom baseUrl from environment', () => {
      const config = getConfigWithEnv({ API_BASE_URL: 'https://api.example.com' });
      expect(config.baseUrl).toBe('https://api.example.com');
    });

    it('should use custom timeout from environment', () => {
      const config = getConfigWithEnv({ API_TIMEOUT: '60000' });
      expect(config.timeout).toBe(60000);
    });

    it('should use custom retryAttempts from environment', () => {
      const config = getConfigWithEnv({ API_RETRY_ATTEMPTS: '5' });
      expect(config.retryAttempts).toBe(5);
    });

    it('should use custom caching settings from environment', () => {
      const config = getConfigWithEnv({
        API_CACHE_ENABLED: 'true',
        API_CACHE_TTL: '600000'
      });
      expect(config.caching.enabled).toBe(true);
      expect(config.caching.ttl).toBe(600000);
    });
  });

  describe('endpoints', () => {
    it('should have correct auth endpoint', () => {
      expect(apiConfig.endpoints.auth).toBe('/api/auth');
    });

    it('should have correct users endpoint', () => {
      expect(apiConfig.endpoints.users).toBe('/api/users');
    });
  });

  describe('type validation', () => {
    const getConfigWithEnv = (env: Record<string, string>): ApiConfig => {
      const originalEnv = { ...process.env };
      Object.assign(process.env, env);
      let config: ApiConfig;
      jest.isolateModules(() => {
        config = require('./api.config').apiConfig;
      });
      process.env = originalEnv;
      return config!; // We know this will be defined because we just set it
    };

    it('should handle invalid numeric values', () => {
      // Test invalid timeout - should be NaN since parseInt('invalid') is NaN
      const config1 = getConfigWithEnv({ API_TIMEOUT: 'invalid' });
      expect(Number.isNaN(config1.timeout)).toBe(true);

      // Test invalid retry attempts - should be NaN since parseInt('2.5') is 2
      const config2 = getConfigWithEnv({ API_RETRY_ATTEMPTS: '2.5' });
      expect(config2.retryAttempts).toBe(2);

      // Test invalid cache TTL - should be NaN since parseInt('1000.99') is 1000
      const config3 = getConfigWithEnv({ API_CACHE_TTL: '1000.99' });
      expect(config3.caching.ttl).toBe(1000);
    });

    it('should handle boolean values correctly', () => {
      // Test true value
      const config1 = getConfigWithEnv({ API_CACHE_ENABLED: 'true' });
      expect(config1.caching.enabled).toBe(true);

      // Test false value
      const config2 = getConfigWithEnv({ API_CACHE_ENABLED: 'false' });
      expect(config2.caching.enabled).toBe(false);

      // Test invalid value
      const config3 = getConfigWithEnv({ API_CACHE_ENABLED: 'invalid' });
      expect(config3.caching.enabled).toBe(false);
    });
  });
}); 