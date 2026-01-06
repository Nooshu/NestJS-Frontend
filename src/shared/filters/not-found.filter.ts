/**
 * Exception filter to handle 404 Not Found errors.
 * This filter provides intelligent handling of 404 errors by:
 * - Silently handling 404s for known browser requests (DevTools, favicon, etc.)
 * - Providing detailed error responses for legitimate 404s
 * - Supporting pattern-based path exclusions
 *
 * @class NotFoundExceptionFilter
 * @implements {ExceptionFilter}
 */

import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { loggingConfig } from '../config/logging.config';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  /**
   * Determines if a given path should be excluded from detailed error logging.
   * Supports two types of patterns:
   * 1. Exact matches (e.g., '/favicon.ico')
   * 2. Extension-based wildcards (e.g., '*.js.map')
   *
   * @private
   * @param {string} path - The request path to check
   * @returns {boolean} True if the path should be excluded, false otherwise
   *
   * @example
   * // Exact match
   * shouldExcludePath('/.well-known/appspecific/com.chrome.devtools.json') // true
   *
   * // Extension match
   * shouldExcludePath('/static/main.js.map') // true
   */
  private shouldExcludePath(path: string): boolean {
    return loggingConfig.base.excludePaths.some((pattern) => {
      // Handle exact matches (e.g., '/favicon.ico')
      if (!pattern.includes('*')) {
        return path === pattern;
      }

      // Handle *.extension patterns (e.g., '*.js.map')
      if (pattern.startsWith('*.')) {
        const extension = pattern.slice(1); // Remove the *
        return path.endsWith(extension);
      }

      return false;
    });
  }

  /**
   * Handles NotFoundException by providing appropriate responses based on the request path.
   * For excluded paths (e.g., browser-generated requests), returns a silent 404.
   * For all other paths, returns a detailed JSON response with error information.
   *
   * @param {NotFoundException} _ - The caught exception (unused)
   * @param {ArgumentsHost} host - Execution context host
   * @returns {void}
   *
   * @example
   * // For excluded paths:
   * // Response: 404 with empty body
   *
   * // For other paths:
   * // Response: 404 with JSON body:
   * // {
   * //   statusCode: 404,
   * //   timestamp: '2025-05-14T16:01:54.417Z',
   * //   path: '/unknown-page',
   * //   message: 'Not Found'
   * // }
   */
  catch(_: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // If the path is in our exclude list, return a silent 404
    if (this.shouldExcludePath(request.path)) {
      return response.status(404).send();
    }

    // For all other paths, return the standard 404 response with error details
    return response.status(404).json({
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Not Found',
    });
  }
}
