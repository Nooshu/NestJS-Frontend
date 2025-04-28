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

    /**
     * CSRF configuration
     */
    csrf: {
      /**
       * Whether CSRF protection is enabled
       * @default true
       */
      enabled: process.env.CSRF_ENABLED !== 'false',

      /**
       * CSRF cookie name
       * @default 'XSRF-TOKEN'
       */
      cookieName: process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN',

      /**
       * CSRF header name
       * @default 'X-XSRF-TOKEN'
       */
      headerName: process.env.CSRF_HEADER_NAME || 'X-XSRF-TOKEN',

      /**
       * CSRF cookie options
       */
      cookieOptions: {
        /**
         * Whether cookie is HTTP only
         * @default true
         */
        httpOnly: process.env.CSRF_COOKIE_HTTP_ONLY !== 'false',

        /**
         * Whether cookie is secure
         * @default true
         */
        secure: process.env.CSRF_COOKIE_SECURE !== 'false',

        /**
         * Cookie same site policy
         * @default 'strict'
         */
        sameSite: process.env.CSRF_COOKIE_SAME_SITE || 'strict',
      },
    },

    /**
     * Content Security Policy configuration
     */
    csp: {
      /**
       * Whether CSP is enabled
       * @default true
       */
      enabled: process.env.CSP_ENABLED !== 'false',

      /**
       * CSP directives
       */
      directives: {
        /**
         * Default CSP directives
         */
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  },

  /**
   * Database configuration
   */
  database: {
    /**
     * Database type
     * @default 'postgres'
     */
    type: process.env.DB_TYPE || 'postgres',

    /**
     * Database host
     * @default 'localhost'
     */
    host: process.env.DB_HOST || 'localhost',

    /**
     * Database port
     * @default 5432
     */
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,

    /**
     * Database username
     * @default 'postgres'
     */
    username: process.env.DB_USERNAME || 'postgres',

    /**
     * Database password
     * @default 'postgres'
     */
    password: process.env.DB_PASSWORD || 'postgres',

    /**
     * Database name
     * @default 'nestjs_frontend'
     */
    database: process.env.DB_NAME || 'nestjs_frontend',

    /**
     * Whether to synchronize database schema
     * @default false
     */
    synchronize: process.env.DB_SYNCHRONIZE === 'true',

    /**
     * Whether to log database queries
     * @default false
     */
    logging: process.env.DB_LOGGING === 'true',
  },

  /**
   * Redis configuration
   */
  redis: {
    /**
     * Whether Redis is enabled
     * @default false
     */
    enabled: process.env.REDIS_ENABLED === 'true',

    /**
     * Redis host
     * @default 'localhost'
     */
    host: process.env.REDIS_HOST || 'localhost',

    /**
     * Redis port
     * @default 6379
     */
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,

    /**
     * Redis password
     */
    password: process.env.REDIS_PASSWORD,

    /**
     * Redis database number
     * @default 0
     */
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  },

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Log level
     * @default 'info'
     */
    level: process.env.LOG_LEVEL || 'info',

    /**
     * Whether to log to console
     * @default true
     */
    console: process.env.LOG_CONSOLE !== 'false',

    /**
     * Whether to log to file
     * @default false
     */
    file: process.env.LOG_FILE === 'true',

    /**
     * Log file path
     * @default 'logs/app.log'
     */
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  },

  /**
   * Performance monitoring configuration
   */
  performance: {
    /**
     * Whether performance monitoring is enabled
     * @default true
     */
    enabled: process.env.PERFORMANCE_ENABLED !== 'false',

    /**
     * Performance sampling rate
     * @default 1
     */
    samplingRate: process.env.PERFORMANCE_SAMPLING_RATE
      ? parseFloat(process.env.PERFORMANCE_SAMPLING_RATE)
      : 1,

    /**
     * Maximum number of performance entries
     * @default 100
     */
    maxEntries: process.env.PERFORMANCE_MAX_ENTRIES
      ? parseInt(process.env.PERFORMANCE_MAX_ENTRIES, 10)
      : 100,

    /**
     * Whether to report on page unload
     * @default true
     */
    reportOnUnload: process.env.PERFORMANCE_REPORT_ON_UNLOAD !== 'false',
  },

  /**
   * Node environment
   * @default 'development'
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * NPM package version
   */
  npmPackageVersion: process.env.npm_package_version,
});
