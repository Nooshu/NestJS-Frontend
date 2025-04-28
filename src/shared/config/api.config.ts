/**
 * Configuration object for API settings.
 * Contains settings for API base URL, timeouts, retry attempts, and caching.
 * All values can be configured through environment variables.
 *
 * @module ApiConfig
 * @description API configuration settings
 */
export const apiConfig = {
  /**
   * Base URL for API requests
   * @default 'http://localhost:8080'
   */
  baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),

  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),

  /**
   * Caching configuration
   */
  caching: {
    /**
     * Whether caching is enabled
     * @default false
     */
    enabled: process.env.API_CACHE_ENABLED === 'true',

    /**
     * Cache time-to-live in milliseconds
     * @default 300000 (5 minutes)
     */
    ttl: parseInt(process.env.API_CACHE_TTL || '300000', 10),
  },

  /**
   * API endpoint paths
   */
  endpoints: {
    /**
     * Authentication endpoint
     */
    auth: '/api/auth',

    /**
     * Users endpoint
     */
    users: '/api/users',
    // Add other endpoints as needed
  },
};
