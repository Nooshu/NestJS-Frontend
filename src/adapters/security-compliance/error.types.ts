export enum SecurityErrorCode {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PASSWORD_POLICY_VIOLATION = 'PASSWORD_POLICY_VIOLATION',
  INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION',
  INVALID_AUTHORIZATION = 'INVALID_AUTHORIZATION',
  SENSITIVE_DATA_EXPOSURE = 'SENSITIVE_DATA_EXPOSURE',
  AUDIT_LOG_FAILURE = 'AUDIT_LOG_FAILURE',
  CACHE_ERROR = 'CACHE_ERROR',
  SECURITY_HEADER_ERROR = 'SECURITY_HEADER_ERROR',
  CORS_VIOLATION = 'CORS_VIOLATION',
  INVALID_REQUEST = 'INVALID_REQUEST'
}

export interface SecurityErrorDetails {
  code: SecurityErrorCode;
  message: string;
  timestamp: string;
  path?: string;
  ip?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityErrorResponse {
  error: {
    code: SecurityErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export class SecurityError extends Error {
  public readonly code: SecurityErrorCode;
  public readonly details: SecurityErrorDetails;

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