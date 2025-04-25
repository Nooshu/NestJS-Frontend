/**
 * Custom Logger Service that implements NestJS Logger interface
 * 
 * This service provides a robust logging solution using Winston under the hood.
 * It implements the NestJS Logger interface to ensure compatibility with NestJS's
 * built-in logging system while providing enhanced features:
 * - Context-aware logging
 * - Multiple log levels (error, warn, info, debug, verbose)
 * - Structured logging with metadata support
 * - Stack trace capture for errors
 * 
 * The service is marked as transient-scoped to ensure each injection gets a fresh
 * instance with its own context. This is particularly useful for request-scoped
 * services that need their own logging context.
 * 
 * @class LoggerService
 * @implements {NestLoggerService}
 * @see https://docs.nestjs.com/techniques/logger
 */
import { Injectable, Scope, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import type { LoggingConfiguration } from '../shared/config/logging.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private readonly config: LoggingConfiguration;

  /**
   * Creates an instance of LoggerService.
   * 
   * @param {Logger} logger - The Winston logger instance injected by NestJS
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('LOGGING_CONFIG') private readonly loggingConfig: LoggingConfiguration,
  ) {
    this.config = loggingConfig;
  }

  /**
   * Sets the context for the logger instance.
   * This is useful for identifying which part of the application is logging.
   * 
   * @param {string} context - The context name (e.g., 'UserService', 'AuthController')
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * Logs a message with the 'error' level.
   * 
   * @param {string} message - The error message
   * @param {string} [trace] - Optional stack trace
   * @param {Record<string, any>} [meta] - Optional metadata to include with the log
   */
  error(message: string, trace?: string, meta?: Record<string, any>) {
    this.logger.error(message, {
      context: this.context,
      trace,
      ...meta,
    });
  }

  /**
   * Logs a message with the 'warn' level.
   * 
   * @param {string} message - The warning message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the warning
   */
  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs a message with the 'info' level.
   * This is the default logging method called by NestJS's built-in logging.
   * 
   * @param {string} message - The message to log
   * @param {Record<string, any>} [meta] - Optional metadata to include with the log
   */
  log(message: string, meta?: Record<string, any>) {
    this.info(message, meta);
  }

  /**
   * Logs a message with the 'info' level.
   * 
   * @param {string} message - The message to log
   * @param {Record<string, any>} [meta] - Optional metadata to include with the log
   */
  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs a message with the 'debug' level.
   * 
   * @param {string} message - The debug message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the debug log
   */
  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs a message with the 'verbose' level.
   * 
   * @param {string} message - The verbose message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the verbose log
   */
  verbose(message: string, meta?: Record<string, any>) {
    this.logger.verbose(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs an audit event.
   * 
   * @param {string} action - The action being audited
   * @param {Record<string, any>} data - The audit data
   */
  audit(action: string, data: Record<string, any>) {
    if (!this.config.audit.enabled) return;

    const auditData = this.maskSensitiveData(data);
    this.logger.info(`AUDIT: ${action}`, {
      context: this.context,
      type: 'audit',
      action,
      ...auditData,
    });
  }

  /**
   * Logs a performance metric.
   * 
   * @param {string} metric - The metric name
   * @param {number} value - The metric value
   * @param {Record<string, any>} [meta] - Optional metadata to include with the metric
   */
  metric(metric: string, value: number, meta?: Record<string, any>) {
    if (!this.config.monitoring.enabled) return;

    this.logger.info(`METRIC: ${metric}`, {
      context: this.context,
      type: 'metric',
      metric,
      value,
      ...meta,
    });
  }

  /**
   * Masks sensitive data in the audit log.
   * 
   * @param {Record<string, any>} data - The data to mask
   * @returns {Record<string, any>} The masked data
   */
  private maskSensitiveData(data: Record<string, any>): Record<string, any> {
    if (!this.config.audit.maskSensitiveData) return data;

    const maskedData = { ...data };
    for (const field of this.config.audit.sensitiveFields) {
      if (field in maskedData) {
        maskedData[field] = '********';
      }
    }
    return maskedData;
  }
} 