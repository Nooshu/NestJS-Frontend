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
 * @see https://docs.nestjs.com/techniques/logger
 */
import { Inject, Injectable, Scope, type LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import type { LoggingConfiguration } from '../shared/config/logging.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  /**
   * Creates an instance of LoggerService.
   *
   * @param logger - The Winston logger instance injected by NestJS
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('LOGGING_CONFIG') private readonly loggingConfig: LoggingConfiguration
  ) {}

  /**
   * Sets the context for the logger instance.
   * This is useful for identifying which part of the application is logging.
   *
   * @param context - The context name (e.g., 'UserService', 'AuthController')
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * Logs a message with the 'error' level.
   *
   * @param message - The error message
   * @param trace - Optional stack trace
   * @param meta - Optional metadata to include with the log
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
   * @param message - The warning message
   * @param meta - Optional metadata to include with the warning
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
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  log(message: string, meta?: Record<string, any>) {
    this.info(message, meta);
  }

  /**
   * Logs a message with the 'info' level.
   *
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
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
   * @param message - The debug message
   * @param meta - Optional metadata to include with the debug log
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
   * @param message - The verbose message
   * @param meta - Optional metadata to include with the verbose log
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
   * @param action - The action being audited
   * @param data - The audit data
   */
  audit(action: string, data: Record<string, any>) {
    if (!this.loggingConfig.audit.enabled) return;

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
   * @param metric - The metric name
   * @param value - The metric value
   * @param meta - Optional metadata to include with the metric
   */
  metric(metric: string, value: number, meta?: Record<string, any>) {
    if (!this.loggingConfig.monitoring.enabled) return;

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
   * @param data - The data to mask
   * @returns The masked data
   */
  private maskSensitiveData(data: Record<string, any>): Record<string, any> {
    if (!this.loggingConfig.audit.maskSensitiveData) return data;

    const maskedData = { ...data };
    for (const field of this.loggingConfig.audit.sensitiveFields) {
      if (field in maskedData) {
        maskedData[field] = '********';
      }
    }
    return maskedData;
  }
}
