import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SecurityConfigModule } from '../config/security.config';

// Extend the Request type to include csrfToken
interface RequestWithCsrf extends Request {
  csrfToken?: () => string;
}

// Mock the middleware modules before importing the middleware
jest.mock('cookie-parser', () => {
  return () => (_req: any, _res: any, next: any) => {
    next();
  };
});

// Import the middleware after setting up mocks
import { CsrfMiddleware } from './csrf.middleware';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let mockRequest: Partial<RequestWithCsrf>;
  let mockResponse: Partial<Response> & { locals: Record<string, any> };
  let nextFunction: jest.Mock;
  let mockCsrfProtection: jest.Mock;

  beforeEach(async () => {
    const mockWinstonLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      silent: false,
      format: {},
      levels: {},
      level: 'info',
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      getMaxListeners: jest.fn(),
      setMaxListeners: jest.fn(),
      eventNames: jest.fn(),
      listenerCount: jest.fn(),
    } as unknown as Logger;

    const moduleRef = await Test.createTestingModule({
      imports: [SecurityConfigModule],
      providers: [
        CsrfMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                'csrf.cookieName': 'XSRF-TOKEN',
                'csrf.headerName': 'X-XSRF-TOKEN',
                'csrf.cookieOptions': {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'strict',
                },
                'security.csrf.enabled': true,
                'security.csrf.cookieName': 'XSRF-TOKEN',
                'security.csrf.cookieOptions.httpOnly': true,
                'security.csrf.cookieOptions.secure': true,
                'security.csrf.cookieOptions.sameSite': 'strict',
              };
              return config[key];
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
            audit: jest.fn(),
            metric: jest.fn(),
            setContext: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockWinstonLogger,
        },
        {
          provide: 'LOGGING_CONFIG',
          useValue: {
            audit: {
              enabled: true,
              maskSensitiveData: true,
              sensitiveFields: ['password', 'token'],
            },
            monitoring: {
              enabled: true,
            },
          },
        },
      ],
    }).compile();

    middleware = moduleRef.get<CsrfMiddleware>(CsrfMiddleware);

    // Create a mock CSRF protection function that can be configured per test
    mockCsrfProtection = jest.fn((_req: any, _res: any, next: any) => {
      next();
    });

    // Set the mock as the CSRF protection
    (middleware as any).csrfProtection = mockCsrfProtection;

    mockRequest = {
      method: 'GET',
      path: '/test',
      headers: {},
      cookies: {},
      csrfToken: () => 'test-csrf-token',
    };

    mockResponse = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
      getHeader: jest.fn(),
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      getMaxListeners: jest.fn(),
      setMaxListeners: jest.fn(),
      eventNames: jest.fn(),
      listenerCount: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe('use', () => {
    it('should set CSRF token in locals for GET requests', () => {
      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(mockResponse.locals.csrfToken).toBe('test-csrf-token');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should validate CSRF token for non-GET requests', () => {
      mockRequest.method = 'POST';
      const testToken = 'test-csrf-token';
      // Use the cookie name from config
      mockRequest.cookies = { 'XSRF-TOKEN': testToken };
      // Set the token in the request body instead of headers
      mockRequest.body = { _csrf: testToken };

      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject invalid CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { _csrf: 'test-token' };
      mockRequest.headers = { 'csrf-token': 'invalid-token' };

      // Configure the mock to simulate an error
      mockCsrfProtection.mockImplementationOnce((_req: any, _res: any, next: any) => {
        next(new Error('Invalid CSRF token'));
      });

      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Invalid CSRF token',
        error: 'Forbidden',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should skip CSRF check for API routes', () => {
      (mockRequest as any).path = '/api/test';
      mockRequest.method = 'POST';

      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.locals.csrfToken).toBeUndefined();
    });

    it('should handle missing CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = {};
      mockRequest.headers = {};

      // Configure the mock to simulate a missing token error
      mockCsrfProtection.mockImplementationOnce((_req: any, _res: any, next: any) => {
        next(new Error('CSRF token missing'));
      });

      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Invalid CSRF token',
        error: 'Forbidden',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { _csrf: 'test-token' };
      mockRequest.headers = { 'csrf-token': 'test-token' };

      // Configure the mock to simulate an error
      mockCsrfProtection.mockImplementationOnce((_req: any, _res: any, next: any) => {
        next(new Error('Test error'));
      });

      middleware.use(mockRequest as RequestWithCsrf, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Invalid CSRF token',
        error: 'Forbidden',
      });
    });
  });
});
