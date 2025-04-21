import { Request, Response, NextFunction } from 'express';
import { SecurityError, SecurityErrorCode } from './error.types';

/**
 * Class responsible for handling security-related errors in the application.
 * Provides centralized error handling with consistent response formats and HTTP status codes.
 */
export class SecurityErrorHandler {
  /**
   * Handles security errors and unexpected errors in the application.
   * Converts errors to appropriate HTTP responses with consistent formatting.
   * 
   * @param error - The error that occurred
   * @param req - The Express request object
   * @param res - The Express response object
   * @param next - The Express next function
   */
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof SecurityError) {
      const response = error.toResponse();
      res.status(this.getStatusCode(error.code)).json(response);
      return;
    }

    // Handle unexpected errors
    const securityError = new SecurityError(
      SecurityErrorCode.INVALID_REQUEST,
      'An unexpected error occurred',
      {
        path: req.path,
        ip: req.ip,
        metadata: {
          originalError: error.message
        }
      }
    );

    const response = securityError.toResponse();
    res.status(500).json(response);
  }

  /**
   * Maps security error codes to appropriate HTTP status codes.
   * Ensures consistent status code usage across the application.
   * 
   * @param code - The security error code
   * @returns The corresponding HTTP status code
   */
  private static getStatusCode(code: SecurityErrorCode): number {
    const statusCodeMap: Record<SecurityErrorCode, number> = {
      [SecurityErrorCode.RATE_LIMIT_EXCEEDED]: 429,
      [SecurityErrorCode.PASSWORD_POLICY_VIOLATION]: 400,
      [SecurityErrorCode.INVALID_AUTHENTICATION]: 401,
      [SecurityErrorCode.INVALID_AUTHORIZATION]: 403,
      [SecurityErrorCode.SENSITIVE_DATA_EXPOSURE]: 400,
      [SecurityErrorCode.AUDIT_LOG_FAILURE]: 500,
      [SecurityErrorCode.CACHE_ERROR]: 500,
      [SecurityErrorCode.SECURITY_HEADER_ERROR]: 500,
      [SecurityErrorCode.CORS_VIOLATION]: 403,
      [SecurityErrorCode.INVALID_REQUEST]: 400
    };

    return statusCodeMap[code] || 500;
  }
}

/**
 * Express middleware function for handling security errors.
 * Wraps the SecurityErrorHandler.handle method for use in Express applications.
 * 
 * @param error - The error that occurred
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 */
export const securityErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  SecurityErrorHandler.handle(error, req, res, next);
}; 