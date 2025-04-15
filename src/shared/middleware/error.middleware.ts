/**
 * Global error handling middleware.
 * Catches and processes unhandled errors in the application.
 * 
 * @module ErrorMiddleware
 * @requires @nestjs/common
 * @requires express
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import configuration from '../config/configuration';

/**
 * Error response interface.
 * 
 * @interface ErrorResponse
 */
interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  stack?: string;
}

/**
 * Global error handling middleware.
 * 
 * @class ErrorMiddleware
 * @description Catches and processes unhandled errors
 */
@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  /**
   * Process the request and handle any errors.
   * 
   * @method use
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      const statusCode = error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      const response: ErrorResponse = {
        statusCode,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.url,
      };

      // Include stack trace in development
      if (configuration().nodeEnv === 'development') {
        response.stack = error.stack;
      }

      res.status(statusCode).json(response);
    }
  }
} 