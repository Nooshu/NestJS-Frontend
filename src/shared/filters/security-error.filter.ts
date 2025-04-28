/**
 * Global exception filter for handling security-related errors.
 * Sanitizes error responses to prevent information leakage in production.
 *
 * @module SecurityErrorFilter
 * @requires @nestjs/common
 * @requires express
 */

import {
  type ArgumentsHost,
  type ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import configuration from '../config/configuration';

/**
 * Interface for sanitized error response
 *
 * @interface SanitizedError
 */
interface SanitizedError {
  status: number;
  message: string;
  stack?: string;
}

/**
 * Global exception filter for security error handling.
 *
 * @class SecurityErrorFilter
 * @description Filters and sanitizes error responses
 *
 * @example
 * // Apply the filter globally in main.ts
 * app.useGlobalFilters(new SecurityErrorFilter());
 */
@Catch()
export class SecurityErrorFilter implements ExceptionFilter {
  /**
   * Sanitizes error information based on environment.
   * In production, removes stack traces and sensitive information.
   *
   * @private
   * @method sanitizeError
   * @param {unknown} error - The error to sanitize
   * @returns {SanitizedError} The sanitized error information
   */
  private sanitizeError(error: unknown): SanitizedError {
    const isProd = configuration().nodeEnv === 'production';

    if (error instanceof HttpException) {
      return {
        status: error.getStatus(),
        message: error.message,
        stack: (isProd ? undefined : error.stack) ?? 'No stack trace available',
      };
    }

    if (error instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        stack: (isProd ? undefined : error.stack) ?? 'No stack trace available',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      stack: 'No stack trace available',
    };
  }

  /**
   * Catches and processes exceptions, applying security sanitization.
   *
   * @method catch
   * @param {unknown} exception - The exception to handle
   * @param {ArgumentsHost} host - The arguments host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const secureError = this.sanitizeError(exception);

    // Log the error securely (without sensitive data)
    console.error('Security Error:', {
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      error: secureError.message,
      status: secureError.status,
    });

    response.status(secureError.status).json({
      statusCode: secureError.status,
      message: secureError.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      stack: secureError.stack,
    });
  }
}
