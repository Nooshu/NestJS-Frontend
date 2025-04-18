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

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  /**
   * Creates an instance of LoggerService.
   * 
   * @param {Logger} logger - The Winston logger instance injected by NestJS
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Sets the logging context for this logger instance.
   * The context is included in all log messages to help identify
   * which part of the application generated the log.
   * 
   * @param {string} context - The context name (e.g., 'UserService', 'AuthController')
   */
  setContext(context: string) {
    this.context = context;
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
   * Logs an error message with optional stack trace and metadata.
   * 
   * @param {string} message - The error message
   * @param {string} [trace] - Optional stack trace
   * @param {Record<string, any>} [meta] - Optional metadata to include with the error
   */
  error(message: string, trace?: string, meta?: Record<string, any>) {
    this.logger.error(message, {
      context: this.context,
      trace,
      ...meta,
    });
  }

  /**
   * Logs a warning message with optional metadata.
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
   * Logs an informational message with optional metadata.
   * 
   * @param {string} message - The informational message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the info
   */
  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs a debug message with optional metadata.
   * Debug messages are typically used during development
   * and are not enabled in production by default.
   * 
   * @param {string} message - The debug message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the debug info
   */
  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, {
      context: this.context,
      ...meta,
    });
  }

  /**
   * Logs a verbose message with optional metadata.
   * Verbose messages provide the most detailed level of logging
   * and are typically used for tracing application flow.
   * 
   * @param {string} message - The verbose message
   * @param {Record<string, any>} [meta] - Optional metadata to include with the verbose info
   */
  verbose(message: string, meta?: Record<string, any>) {
    this.logger.verbose(message, {
      context: this.context,
      ...meta,
    });
  }
} 