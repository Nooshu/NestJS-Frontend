/**
 * Enumeration of security error codes used throughout the application.
 * Each code represents a specific type of security-related error that can occur.
 */
export enum SecurityErrorCode {
  /** Error when rate limit is exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Error when password does not meet policy requirements */
  PASSWORD_POLICY_VIOLATION = 'PASSWORD_POLICY_VIOLATION',
  /** Error when authentication fails */
  INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION',
  /** Error when user lacks required permissions */
  INVALID_AUTHORIZATION = 'INVALID_AUTHORIZATION',
  /** Error when sensitive data is exposed */
  SENSITIVE_DATA_EXPOSURE = 'SENSITIVE_DATA_EXPOSURE',
  /** Error when audit logging fails */
  AUDIT_LOG_FAILURE = 'AUDIT_LOG_FAILURE',
  /** Error when cache operations fail */
  CACHE_ERROR = 'CACHE_ERROR',
  /** Error when security headers cannot be set */
  SECURITY_HEADER_ERROR = 'SECURITY_HEADER_ERROR',
  /** Error when CORS policy is violated */
  CORS_VIOLATION = 'CORS_VIOLATION',
  /** Error when request is invalid */
  INVALID_REQUEST = 'INVALID_REQUEST'
}

/**
 * Interface defining the structure of security error details.
 * Contains metadata about the error occurrence.
 */
export interface SecurityErrorDetails {
  /** The type of security error that occurred */
  code: SecurityErrorCode;
  /** Human-readable error message */
  message: string;
  /** ISO timestamp of when the error occurred */
  timestamp: string;
  /** The request path where the error occurred */
  path?: string;
  /** The IP address of the client that caused the error */
  ip?: string;
  /** The ID of the user associated with the error (if applicable) */
  userId?: string;
  /** Additional metadata about the error */
  metadata?: Record<string, unknown>;
}

/**
 * Interface defining the structure of error responses sent to clients.
 * Follows a consistent format for all security-related errors.
 */
export interface SecurityErrorResponse {
  /** The error information */
  error: {
    /** The type of security error */
    code: SecurityErrorCode;
    /** Human-readable error message */
    message: string;
    /** Additional error details (if any) */
    details?: Record<string, unknown>;
  };
  /** ISO timestamp of when the error occurred */
  timestamp: string;
}

/**
 * Custom error class for security-related errors.
 * Extends the standard Error class with additional security-specific properties.
 */
export class SecurityError extends Error {
  /** The type of security error */
  public readonly code: SecurityErrorCode;
  /** Detailed information about the error */
  public readonly details: SecurityErrorDetails;

  /**
   * Creates a new SecurityError instance.
   * @param code - The type of security error
   * @param message - Human-readable error message
   * @param details - Optional additional error details
   */
  constructor(code: SecurityErrorCode, message: string, details?: Partial<SecurityErrorDetails>) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.details = {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  }

  /**
   * Converts the error to a standardized response format.
   * @returns A SecurityErrorResponse object ready to be sent to the client
   */
  toResponse(): SecurityErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details.metadata
      },
      timestamp: this.details.timestamp
    };
  }
} 