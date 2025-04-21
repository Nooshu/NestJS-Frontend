import { JavaApiClientConfig } from '../java-api.client';

/**
 * Configuration examples for different environments
 */

// Development environment configuration
export const devConfig: JavaApiClientConfig = {
  baseUrl: process.env.JAVA_API_DEV_URL || 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  auth: {
    type: 'basic',
    credentials: {
      username: process.env.JAVA_API_DEV_USERNAME,
      password: process.env.JAVA_API_DEV_PASSWORD
    }
  }
};

// Staging environment configuration
export const stagingConfig: JavaApiClientConfig = {
  baseUrl: process.env.JAVA_API_STAGING_URL || 'https://staging-api.example.gov.uk',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: process.env.JAVA_API_STAGING_CLIENT_ID,
      clientSecret: process.env.JAVA_API_STAGING_CLIENT_SECRET
    }
  }
};

// Production environment configuration
export const prodConfig: JavaApiClientConfig = {
  baseUrl: process.env.JAVA_API_PROD_URL || 'https://api.example.gov.uk',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: process.env.JAVA_API_PROD_CLIENT_ID,
      clientSecret: process.env.JAVA_API_PROD_CLIENT_SECRET
    }
  }
};

/**
 * Get configuration based on environment
 */
export function getConfig(env: string): JavaApiClientConfig {
  switch (env) {
    case 'development':
      return devConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return prodConfig;
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
} 