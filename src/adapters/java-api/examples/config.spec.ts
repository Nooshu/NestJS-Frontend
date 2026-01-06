import { JavaApiClientConfig } from '../java-api.client';
import { devConfig, stagingConfig, prodConfig, getConfig } from './config';

// Mock environment variables
const originalEnv = process.env;

describe('Java API Config', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('devConfig', () => {
    it('should have correct default values when environment variables are not set', () => {
      // Clear relevant environment variables
      delete process.env.JAVA_API_DEV_URL;
      delete process.env.JAVA_API_DEV_USERNAME;
      delete process.env.JAVA_API_DEV_PASSWORD;

      expect(devConfig).toEqual({
        baseUrl: 'http://localhost:8080',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'basic',
          credentials: {
            username: undefined,
            password: undefined,
          },
        },
      });
    });

    it('should use environment variables when set', () => {
      // Set environment variables
      process.env.JAVA_API_DEV_URL = 'http://dev-api.example.gov.uk';
      process.env.JAVA_API_DEV_USERNAME = 'devuser';
      process.env.JAVA_API_DEV_PASSWORD = 'devpass';

      // Re-import to get updated config
      jest.resetModules();
      const { devConfig: updatedDevConfig } = require('./config');

      expect(updatedDevConfig).toEqual({
        baseUrl: 'http://dev-api.example.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'basic',
          credentials: {
            username: 'devuser',
            password: 'devpass',
          },
        },
      });
    });

    it('should have correct auth type', () => {
      expect(devConfig.auth?.type).toBe('basic');
    });

    it('should conform to JavaApiClientConfig interface', () => {
      const config: JavaApiClientConfig = devConfig;
      expect(config).toBeDefined();
      expect(typeof config.baseUrl).toBe('string');
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.retryAttempts).toBe('number');
      expect(typeof config.retryDelay).toBe('number');
      expect(config.auth).toBeDefined();
    });
  });

  describe('stagingConfig', () => {
    it('should have correct default values when environment variables are not set', () => {
      // Clear relevant environment variables
      delete process.env.JAVA_API_STAGING_URL;
      delete process.env.JAVA_API_STAGING_CLIENT_ID;
      delete process.env.JAVA_API_STAGING_CLIENT_SECRET;

      expect(stagingConfig).toEqual({
        baseUrl: 'https://staging-api.example.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: undefined,
            clientSecret: undefined,
          },
        },
      });
    });

    it('should use environment variables when set', () => {
      // Set environment variables
      process.env.JAVA_API_STAGING_URL = 'https://custom-staging-api.example.gov.uk';
      process.env.JAVA_API_STAGING_CLIENT_ID = 'staging-client';
      process.env.JAVA_API_STAGING_CLIENT_SECRET = 'staging-secret';

      // Re-import to get updated config
      jest.resetModules();
      const { stagingConfig: updatedStagingConfig } = require('./config');

      expect(updatedStagingConfig).toEqual({
        baseUrl: 'https://custom-staging-api.example.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: 'staging-client',
            clientSecret: 'staging-secret',
          },
        },
      });
    });

    it('should have correct auth type', () => {
      expect(stagingConfig.auth?.type).toBe('oauth2');
    });

    it('should conform to JavaApiClientConfig interface', () => {
      const config: JavaApiClientConfig = stagingConfig;
      expect(config).toBeDefined();
      expect(typeof config.baseUrl).toBe('string');
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.retryAttempts).toBe('number');
      expect(typeof config.retryDelay).toBe('number');
      expect(config.auth).toBeDefined();
    });
  });

  describe('prodConfig', () => {
    it('should have correct default values when environment variables are not set', () => {
      // Clear relevant environment variables
      delete process.env.JAVA_API_PROD_URL;
      delete process.env.JAVA_API_PROD_CLIENT_ID;
      delete process.env.JAVA_API_PROD_CLIENT_SECRET;

      expect(prodConfig).toEqual({
        baseUrl: 'https://api.example.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: undefined,
            clientSecret: undefined,
          },
        },
      });
    });

    it('should use environment variables when set', () => {
      // Set environment variables
      process.env.JAVA_API_PROD_URL = 'https://custom-prod-api.example.gov.uk';
      process.env.JAVA_API_PROD_CLIENT_ID = 'prod-client';
      process.env.JAVA_API_PROD_CLIENT_SECRET = 'prod-secret';

      // Re-import to get updated config
      jest.resetModules();
      const { prodConfig: updatedProdConfig } = require('./config');

      expect(updatedProdConfig).toEqual({
        baseUrl: 'https://custom-prod-api.example.gov.uk',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: 'prod-client',
            clientSecret: 'prod-secret',
          },
        },
      });
    });

    it('should have correct auth type', () => {
      expect(prodConfig.auth?.type).toBe('oauth2');
    });

    it('should conform to JavaApiClientConfig interface', () => {
      const config: JavaApiClientConfig = prodConfig;
      expect(config).toBeDefined();
      expect(typeof config.baseUrl).toBe('string');
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.retryAttempts).toBe('number');
      expect(typeof config.retryDelay).toBe('number');
      expect(config.auth).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return devConfig for development environment', () => {
      const config = getConfig('development');
      expect(config).toBe(devConfig);
    });

    it('should return stagingConfig for staging environment', () => {
      const config = getConfig('staging');
      expect(config).toBe(stagingConfig);
    });

    it('should return prodConfig for production environment', () => {
      const config = getConfig('production');
      expect(config).toBe(prodConfig);
    });

    it('should throw error for unknown environment', () => {
      expect(() => getConfig('unknown')).toThrow('Unknown environment: unknown');
    });

    it('should throw error for empty environment', () => {
      expect(() => getConfig('')).toThrow('Unknown environment: ');
    });

    it('should be case sensitive', () => {
      expect(() => getConfig('Development')).toThrow('Unknown environment: Development');
      expect(() => getConfig('PRODUCTION')).toThrow('Unknown environment: PRODUCTION');
    });

    it('should handle null and undefined environments', () => {
      expect(() => getConfig(null as any)).toThrow('Unknown environment: null');
      expect(() => getConfig(undefined as any)).toThrow('Unknown environment: undefined');
    });
  });

  describe('Configuration consistency', () => {
    it('should have consistent timeout values across all environments', () => {
      expect(devConfig.timeout).toBe(30000);
      expect(stagingConfig.timeout).toBe(30000);
      expect(prodConfig.timeout).toBe(30000);
    });

    it('should have consistent retryAttempts values across all environments', () => {
      expect(devConfig.retryAttempts).toBe(3);
      expect(stagingConfig.retryAttempts).toBe(3);
      expect(prodConfig.retryAttempts).toBe(3);
    });

    it('should have consistent retryDelay values across all environments', () => {
      expect(devConfig.retryDelay).toBe(1000);
      expect(stagingConfig.retryDelay).toBe(1000);
      expect(prodConfig.retryDelay).toBe(1000);
    });

    it('should have different auth types for dev vs staging/prod', () => {
      expect(devConfig.auth?.type).toBe('basic');
      expect(stagingConfig.auth?.type).toBe('oauth2');
      expect(prodConfig.auth?.type).toBe('oauth2');
    });

    it('should have different base URLs for each environment', () => {
      expect(devConfig.baseUrl).toBe('http://localhost:8080');
      expect(stagingConfig.baseUrl).toBe('https://staging-api.example.gov.uk');
      expect(prodConfig.baseUrl).toBe('https://api.example.gov.uk');
    });
  });
});
