import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { SecurityAuditMiddleware } from '../security-audit.middleware';
import { LoggerService } from '../../../logger/logger.service';

describe('SecurityAuditMiddleware', () => {
  let middleware: SecurityAuditMiddleware;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(async () => {
    mockLogger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      verbose: jest.fn(),
      audit: jest.fn(),
      metric: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityAuditMiddleware, { provide: LoggerService, useValue: mockLogger }],
    }).compile();

    middleware = module.get<SecurityAuditMiddleware>(SecurityAuditMiddleware);

    mockRequest = {
      ip: '127.0.0.1',
      path: '/test',
      method: 'GET',
      url: '/test',
      query: {},
      headers: {
        'user-agent': 'test-agent',
      },
      connection: {
        remoteAddress: '127.0.0.1',
      } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      statusCode: 200,
      getHeaders: jest.fn().mockReturnValue({}),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('use', () => {
    it('should not audit requests that do not meet audit criteria', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should audit authentication requests', () => {
      const authRequest = { ...mockRequest, path: '/auth/login' };

      middleware.use(authRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should audit admin requests', () => {
      const adminRequest = { ...mockRequest, path: '/admin/users' };

      middleware.use(adminRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should audit API requests', () => {
      const apiRequest = { ...mockRequest, path: '/api/users' };

      middleware.use(apiRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should audit requests with suspicious headers', () => {
      const suspiciousRequest = {
        ...mockRequest,
        headers: { ...mockRequest.headers, 'x-suspicious-request': 'true' },
      };

      middleware.use(suspiciousRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should detect and log suspicious activity', () => {
      const suspiciousRequest = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd',
        headers: { ...mockRequest.headers, 'user-agent': 'sqlmap' },
      };

      middleware.use(suspiciousRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'suspicious_activity',
            severity: 'medium',
            details: expect.objectContaining({
              reasons: expect.arrayContaining([
                expect.stringContaining('Suspicious URL pattern'),
                expect.stringContaining('Suspicious user agent'),
              ]),
            }),
          }),
        })
      );
    });

    it('should log authentication events for successful auth requests', () => {
      const authRequest = { ...mockRequest, path: '/auth/login' };
      const authResponse = { ...mockResponse, statusCode: 200 };

      middleware.use(authRequest as Request, authResponse as Response, mockNext);

      // Simulate response end to trigger logging
      (authResponse.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Security Event: authentication',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'authentication',
            severity: 'low',
            details: expect.objectContaining({
              success: true,
            }),
          }),
        })
      );
    });

    it('should log validation errors for 400 status codes', () => {
      const request = { ...mockRequest, path: '/api/users' };
      const response = { ...mockResponse, statusCode: 400 };

      middleware.use(request as Request, response as Response, mockNext);

      // Simulate response end to trigger logging
      (response.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Security Event: validation_error',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'validation_error',
            severity: 'low',
            details: expect.objectContaining({
              statusCode: 400,
            }),
          }),
        })
      );
    });

    it('should log authentication errors for 401 status codes', () => {
      const request = { ...mockRequest, path: '/api/users' };
      const response = { ...mockResponse, statusCode: 401 };

      middleware.use(request as Request, response as Response, mockNext);

      // Simulate response end to trigger logging
      (response.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: authentication',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'authentication',
            severity: 'medium',
            details: expect.objectContaining({
              statusCode: 401,
            }),
          }),
        })
      );
    });

    it('should log authorization errors for 403 status codes', () => {
      const request = { ...mockRequest, path: '/api/users' };
      const response = { ...mockResponse, statusCode: 403 };

      middleware.use(request as Request, response as Response, mockNext);

      // Simulate response end to trigger logging
      (response.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: authorization',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'authorization',
            severity: 'medium',
            details: expect.objectContaining({
              statusCode: 403,
            }),
          }),
        })
      );
    });

    it('should log rate limit errors for 429 status codes', () => {
      const request = { ...mockRequest, path: '/api/users' };
      const response = { ...mockResponse, statusCode: 429 };

      middleware.use(request as Request, response as Response, mockNext);

      // Simulate response end to trigger logging
      (response.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Security Event: rate_limit',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'rate_limit',
            severity: 'high',
            details: expect.objectContaining({
              statusCode: 429,
            }),
          }),
        })
      );
    });

    it('should log high severity errors for 500+ status codes', () => {
      const request = { ...mockRequest, path: '/api/users' };
      const response = { ...mockResponse, statusCode: 500 };

      middleware.use(request as Request, response as Response, mockNext);

      // Simulate response end to trigger logging
      (response.end as jest.Mock)();

      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Security Event: validation_error',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: 'validation_error',
            severity: 'high',
            details: expect.objectContaining({
              statusCode: 500,
            }),
          }),
        })
      );
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should detect path traversal attempts', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?file=../../../etc/passwd',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining([expect.stringContaining('Suspicious URL pattern')]),
            }),
          }),
        })
      );
    });

    it('should detect XSS attempts', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=<script>alert("xss")</script>',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining([expect.stringContaining('Suspicious URL pattern')]),
            }),
          }),
        })
      );
    });

    it('should detect SQL injection attempts', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=SELECT * FROM users',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining([expect.stringContaining('Suspicious URL pattern')]),
            }),
          }),
        })
      );
    });

    it('should detect suspicious file extensions', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?file=test.php',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining([expect.stringContaining('Suspicious URL pattern')]),
            }),
          }),
        })
      );
    });

    it('should detect suspicious user agents', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        headers: { ...mockRequest.headers, 'user-agent': 'sqlmap/1.0' },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining([expect.stringContaining('Suspicious user agent')]),
            }),
          }),
        })
      );
    });

    it('should detect POST requests without content-type', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        method: 'POST',
        headers: { ...mockRequest.headers },
      };
      delete request.headers!['content-type'];

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining(['POST request without content-type header']),
            }),
          }),
        })
      );
    });

    it('should detect multiple proxy forwarding', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        headers: {
          ...mockRequest.headers,
          'x-forwarded-for': '192.168.1.1,10.0.0.1,172.16.0.1,8.8.8.8',
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining(['Multiple proxy forwarding detected']),
            }),
          }),
        })
      );
    });

    it('should detect suspicious headers', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        headers: {
          ...mockRequest.headers,
          'x-cluster-client-ip': '192.168.1.100',
        },
        ip: '127.0.0.1',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            details: expect.objectContaining({
              reasons: expect.arrayContaining(['Suspicious header: x-cluster-client-ip']),
            }),
          }),
        })
      );
    });
  });

  describe('getClientInfo', () => {
    it('should extract client info from x-forwarded-for header', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        headers: {
          ...mockRequest.headers,
          'x-forwarded-for': '192.168.1.1,10.0.0.1',
          'x-session-id': 'session123',
          'x-user-id': 'user456',
          referer: 'https://example.com',
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            clientInfo: expect.objectContaining({
              ip: '192.168.1.1',
              sessionId: 'session123',
              userId: 'user456',
              referer: 'https://example.com',
            }),
          }),
        })
      );
    });

    it('should extract client info from x-real-ip header', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        headers: {
          ...mockRequest.headers,
          'x-real-ip': '10.0.0.1',
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            clientInfo: expect.objectContaining({
              ip: '10.0.0.1',
            }),
          }),
        })
      );
    });

    it('should fallback to req.ip', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        ip: '172.16.0.1',
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            clientInfo: expect.objectContaining({
              ip: '172.16.0.1',
            }),
          }),
        })
      );
    });

    it('should fallback to connection.remoteAddress', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        ip: undefined,
        connection: {
          remoteAddress: '192.168.0.1',
        } as any,
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            clientInfo: expect.objectContaining({
              ip: '192.168.0.1',
            }),
          }),
        })
      );
    });

    it('should use unknown for missing IP', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        ip: undefined,
        connection: {
          remoteAddress: undefined,
        } as any,
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            clientInfo: expect.objectContaining({
              ip: 'unknown',
            }),
          }),
        })
      );
    });
  });

  describe('sanitization', () => {
    it('should sanitize sensitive headers', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        headers: {
          ...mockRequest.headers,
          authorization: 'Bearer token123',
          cookie: 'session=abc123',
          'x-api-key': 'secret-key',
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            requestInfo: expect.objectContaining({
              headers: expect.objectContaining({
                authorization: '[REDACTED]',
                cookie: '[REDACTED]',
                'x-api-key': '[REDACTED]',
              }),
            }),
          }),
        })
      );
    });

    it('should sanitize sensitive query parameters', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        query: {
          username: 'testuser',
          password: 'secretpass',
          token: 'abc123',
          normal: 'value',
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            requestInfo: expect.objectContaining({
              query: expect.objectContaining({
                username: 'testuser',
                password: '[REDACTED]',
                token: '[REDACTED]',
                normal: 'value',
              }),
            }),
          }),
        })
      );
    });

    it('should sanitize nested objects with sensitive keys', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        query: {
          user: {
            name: 'test',
            password: 'secret',
            credentials: {
              key: 'value',
              secret: 'hidden',
            },
          },
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            requestInfo: expect.objectContaining({
              query: expect.objectContaining({
                user: expect.objectContaining({
                  name: 'test',
                  password: '[REDACTED]',
                  credentials: '[REDACTED]',
                }),
              }),
            }),
          }),
        })
      );
    });

    it('should sanitize arrays with sensitive data', () => {
      const request = {
        ...mockRequest,
        path: '/auth/login',
        url: '/auth/login?q=../etc/passwd', // Trigger suspicious activity
        query: {
          users: [
            { name: 'user1', password: 'pass1' },
            { name: 'user2', token: 'token2' },
          ],
        },
      };

      middleware.use(request as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event: suspicious_activity',
        undefined,
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            requestInfo: expect.objectContaining({
              query: expect.objectContaining({
                users: [
                  { name: 'user1', password: '[REDACTED]' },
                  { name: 'user2', token: '[REDACTED]' },
                ],
              }),
            }),
          }),
        })
      );
    });
  });

  describe('getLogLevel', () => {
    it('should return error for critical severity', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse, statusCode: 500 };

      middleware.use(request as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return error for high severity', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse, statusCode: 429 };

      middleware.use(request as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return warn for medium severity', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse, statusCode: 401 };

      middleware.use(request as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return info for low severity', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse, statusCode: 200 };

      middleware.use(request as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('response handling', () => {
    it('should preserve original response end functionality', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse };
      const originalEnd = response.end;

      middleware.use(request as Request, response as Response, mockNext);

      // The end function should be replaced but still callable
      expect(response.end).not.toBe(originalEnd);
      expect(typeof response.end).toBe('function');

      // Should still work as expected
      (response.end as jest.Mock)();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle response with chunk and encoding', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse };

      middleware.use(request as Request, response as Response, mockNext);

      // Call with chunk and encoding
      (response.end as jest.Mock)('response data', 'utf8');

      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle response with callback', () => {
      const request = { ...mockRequest, path: '/auth/login' };
      const response = { ...mockResponse };
      const callback = jest.fn();

      middleware.use(request as Request, response as Response, mockNext);

      // Call with callback
      (response.end as jest.Mock)('data', 'utf8', callback);

      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});
