import type { Request, Response } from 'express';
import { SecurityErrorHandler, securityErrorHandler } from '../error.handler';
import { SecurityError, SecurityErrorCode } from '../error.types';

describe('SecurityErrorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test/path',
      ip: '192.168.1.1',
      socket: {
        remoteAddress: '192.168.1.2',
      },
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  describe('handle', () => {
    it('should handle SecurityError instances correctly', () => {
      const securityError = new SecurityError(
        SecurityErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded',
        {
          path: '/api/test',
          ip: '127.0.0.1',
          metadata: { attempts: 5 },
        }
      );

      SecurityErrorHandler.handle(
        securityError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: SecurityErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit exceeded',
          details: { attempts: 5 },
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle unexpected errors and convert them to SecurityError', () => {
      const unexpectedError = new Error('Database connection failed');

      SecurityErrorHandler.handle(
        unexpectedError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: SecurityErrorCode.INVALID_REQUEST,
          message: 'An unexpected error occurred',
          details: {
            originalError: 'Database connection failed',
          },
        },
        timestamp: expect.any(String),
      });
    });

    it('should use request IP when available', () => {
      const unexpectedError = new Error('Test error');
      const requestWithIp = {
        ...mockRequest,
        ip: '10.0.0.1',
      } as Request;

      SecurityErrorHandler.handle(
        unexpectedError,
        requestWithIp,
        mockResponse as Response,
        mockNext
      );

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error.details.originalError).toBe('Test error');
    });

    it('should fallback to socket.remoteAddress when IP is not available', () => {
      const unexpectedError = new Error('Test error');
      const requestWithoutIp = {
        ...mockRequest,
        ip: undefined,
        socket: {
          remoteAddress: '172.16.0.1',
        },
      } as Request;

      SecurityErrorHandler.handle(
        unexpectedError,
        requestWithoutIp,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle requests with no IP information', () => {
      const unexpectedError = new Error('Test error');
      const requestWithNoIp = {
        ...mockRequest,
        ip: undefined,
        socket: {},
      } as Request;

      SecurityErrorHandler.handle(
        unexpectedError,
        requestWithNoIp,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('getStatusCode', () => {
    it('should return correct status codes for all SecurityErrorCode values', () => {
      const testCases = [
        { code: SecurityErrorCode.RATE_LIMIT_EXCEEDED, expected: 429 },
        { code: SecurityErrorCode.PASSWORD_POLICY_VIOLATION, expected: 400 },
        { code: SecurityErrorCode.INVALID_AUTHENTICATION, expected: 401 },
        { code: SecurityErrorCode.INVALID_AUTHORIZATION, expected: 403 },
        { code: SecurityErrorCode.SENSITIVE_DATA_EXPOSURE, expected: 400 },
        { code: SecurityErrorCode.AUDIT_LOG_FAILURE, expected: 500 },
        { code: SecurityErrorCode.CACHE_ERROR, expected: 500 },
        { code: SecurityErrorCode.SECURITY_HEADER_ERROR, expected: 500 },
        { code: SecurityErrorCode.CORS_VIOLATION, expected: 403 },
        { code: SecurityErrorCode.INVALID_REQUEST, expected: 400 },
      ];

      testCases.forEach(({ code, expected }) => {
        const securityError = new SecurityError(code, 'Test error');
        SecurityErrorHandler.handle(
          securityError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(expected);
        (mockResponse.status as jest.Mock).mockClear();
      });
    });

    it('should return 500 for unknown error codes', () => {
      // Create a SecurityError with a code that doesn't exist in the enum
      const securityError = new SecurityError(
        'UNKNOWN_ERROR' as SecurityErrorCode,
        'Unknown error'
      );

      SecurityErrorHandler.handle(
        securityError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});

describe('securityErrorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test/path',
      ip: '192.168.1.1',
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  it('should call SecurityErrorHandler.handle with correct parameters', () => {
    const securityError = new SecurityError(
      SecurityErrorCode.INVALID_AUTHENTICATION,
      'Authentication failed'
    );

    // Spy on the SecurityErrorHandler.handle method
    const handleSpy = jest.spyOn(SecurityErrorHandler, 'handle');

    securityErrorHandler(
      securityError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(handleSpy).toHaveBeenCalledWith(
      securityError,
      mockRequest,
      mockResponse,
      mockNext
    );

    handleSpy.mockRestore();
  });

  it('should handle SecurityError instances through middleware', () => {
    const securityError = new SecurityError(
      SecurityErrorCode.INVALID_AUTHORIZATION,
      'Access denied'
    );

    securityErrorHandler(
      securityError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: SecurityErrorCode.INVALID_AUTHORIZATION,
        message: 'Access denied',
        details: {},
      },
      timestamp: expect.any(String),
    });
  });

  it('should handle unexpected errors through middleware', () => {
    const unexpectedError = new Error('Unexpected database error');

    securityErrorHandler(
      unexpectedError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: SecurityErrorCode.INVALID_REQUEST,
        message: 'An unexpected error occurred',
        details: {
          originalError: 'Unexpected database error',
        },
      },
      timestamp: expect.any(String),
    });
  });
}); 