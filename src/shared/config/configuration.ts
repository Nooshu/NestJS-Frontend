/**
 * Default application configuration.
 * Provides centralized configuration management with environment variable support.
 * 
 * @module Configuration
 * @description Application configuration settings
 * 
 * @example
 * // Import and use configuration
 * import configuration from './configuration';
 * const config = configuration();
 * 
 * @returns {Object} Configuration object with application settings
 */
export default () => ({
  /**
   * Application port number
   * @default 3000
   */
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  /**
   * Application environment
   * @default 'development'
   */
  environment: process.env.NODE_ENV || 'development',

  /**
   * Views configuration
   */
  views: {
    /**
     * Directory containing view templates
     * @default 'src/views'
     */
    directory: process.env.VIEWS_DIRECTORY || 'src/views',

    /**
     * Whether to cache compiled templates
     * @default false
     */
    cache: process.env.VIEWS_CACHE === 'true',
  },

  /**
   * Public assets configuration
   */
  public: {
    /**
     * Directory containing public assets
     * @default 'src/public'
     */
    directory: process.env.PUBLIC_DIRECTORY || 'src/public',
  },

  /**
   * Security configuration
   */
  security: {
    /**
     * CORS configuration
     */
    cors: {
      /**
       * Whether CORS is enabled
       * @default false
       */
      enabled: process.env.CORS_ENABLED === 'true',

      /**
       * Allowed CORS origins
       * @default '*'
       */
      origin: process.env.CORS_ORIGIN || '*',
    },
  },

  /**
   * Node environment
   * @default 'development'
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * CORS origin
   * @default 'http://localhost:3000'
   */
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  /**
   * NPM package version
   */
  npmPackageVersion: process.env.npm_package_version,
}); 