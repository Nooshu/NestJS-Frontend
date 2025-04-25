import * as Joi from 'joi';

/**
 * Configuration validation schema
 * Validates environment variables and configuration values
 */
export const configurationSchema = Joi.object({
  // Application
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  APP_NAME: Joi.string().default('nestjs-frontend'),

  // Views
  VIEWS_DIRECTORY: Joi.string().default('src/views'),
  VIEWS_CACHE: Joi.boolean().default(false),

  // Public
  PUBLIC_DIRECTORY: Joi.string().default('src/public'),

  // Security
  CORS_ENABLED: Joi.boolean().default(false),
  CORS_ORIGIN: Joi.string().default('*'),
  CSRF_ENABLED: Joi.boolean().default(true),
  CSRF_COOKIE_NAME: Joi.string().default('XSRF-TOKEN'),
  CSRF_HEADER_NAME: Joi.string().default('X-XSRF-TOKEN'),
  CSRF_COOKIE_HTTP_ONLY: Joi.boolean().default(true),
  CSRF_COOKIE_SECURE: Joi.boolean().default(true),
  CSRF_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('strict'),
  CSP_ENABLED: Joi.boolean().default(true),

  // Database
  DB_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite').default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('nestjs_frontend'),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // Redis
  REDIS_ENABLED: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),
  REDIS_DB: Joi.number().default(0),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_CONSOLE: Joi.boolean().default(true),
  LOG_FILE: Joi.boolean().default(false),
  LOG_FILE_PATH: Joi.string().default('logs/app.log'),
  LOG_FILE_MAX_SIZE: Joi.number().default(10 * 1024 * 1024), // 10MB
  LOG_FILE_MAX_FILES: Joi.number().default(5),
  LOG_AUDIT_ENABLED: Joi.boolean().default(true),
  LOG_MONITORING_ENABLED: Joi.boolean().default(true),
  LOG_MONITORING_ERROR_RATE_THRESHOLD: Joi.number().default(5),
  LOG_MONITORING_RESPONSE_TIME_THRESHOLD: Joi.number().default(1000),
  LOG_MONITORING_MEMORY_USAGE_THRESHOLD: Joi.number().default(80),

  // Performance
  PERFORMANCE_ENABLED: Joi.boolean().default(true),
  PERFORMANCE_SAMPLING_RATE: Joi.number().default(1),
  PERFORMANCE_MAX_ENTRIES: Joi.number().default(100),
  PERFORMANCE_REPORT_ON_UNLOAD: Joi.boolean().default(true),
}); 