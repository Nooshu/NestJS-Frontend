import { Logger } from 'pino';

/**
 * Logging configuration interface
 */
export interface LoggingConfig {
  /**
   * Base logging configuration
   */
  base: {
    /**
     * Application name for logging
     */
    appName: string;
    
    /**
     * Environment (development, staging, production)
     */
    environment: string;
    
    /**
     * Log level (trace, debug, info, warn, error, fatal)
     */
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    
    /**
     * Whether to enable pretty printing in development
     */
    prettyPrint: boolean;
    
    /**
     * Logger instance
     */
    logger?: Logger;
  };
  
  /**
   * Audit logging configuration
   */
  audit: {
    /**
     * Whether to enable audit logging
     */
    enabled: boolean;
    
    /**
     * Fields to include in audit logs
     */
    include: string[];
    
    /**
     * Fields to exclude from audit logs
     */
    exclude: string[];
    
    /**
     * Whether to mask sensitive data
     */
    maskSensitiveData: boolean;
    
    /**
     * Fields to mask in audit logs
     */
    sensitiveFields: string[];
  };
  
  /**
   * Monitoring configuration
   */
  monitoring: {
    /**
     * Whether to enable monitoring
     */
    enabled: boolean;
    
    /**
     * Metrics to collect
     */
    metrics: {
      /**
       * Whether to collect HTTP metrics
       */
      http: boolean;
      
      /**
       * Whether to collect system metrics
       */
      system: boolean;
      
      /**
       * Whether to collect business metrics
       */
      business: boolean;
    };
    
    /**
     * Alerting configuration
     */
    alerting: {
      /**
       * Whether to enable alerting
       */
      enabled: boolean;
      
      /**
       * Alert thresholds
       */
      thresholds: {
        /**
         * Error rate threshold (percentage)
         */
        errorRate: number;
        
        /**
         * Response time threshold (milliseconds)
         */
        responseTime: number;
        
        /**
         * Memory usage threshold (percentage)
         */
        memoryUsage: number;
      };
    };
  };
}

/**
 * Default logging configuration
 */
export const loggingConfig: LoggingConfig = {
  base: {
    appName: process.env.APP_NAME || 'government-service',
    environment: process.env.NODE_ENV || 'development',
    level: (process.env.LOG_LEVEL as LoggingConfig['base']['level']) || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  },
  
  audit: {
    enabled: true,
    include: [
      'timestamp',
      'user',
      'action',
      'resource',
      'status',
      'ip',
      'userAgent',
      'requestId',
    ],
    exclude: ['password', 'token'],
    maskSensitiveData: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
    ],
  },
  
  monitoring: {
    enabled: true,
    metrics: {
      http: true,
      system: true,
      business: true,
    },
    alerting: {
      enabled: true,
      thresholds: {
        errorRate: 5, // 5% error rate threshold
        responseTime: 1000, // 1 second response time threshold
        memoryUsage: 80, // 80% memory usage threshold
      },
    },
  },
}; 