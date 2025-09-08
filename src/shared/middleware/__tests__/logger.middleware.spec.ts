import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { LoggerMiddleware } from '../logger.middleware';
import { LoggerService } from '../../../logger/logger.service';
import { loggingConfig } from '../../config/logging.config';

// Mock the logging config
jest.mock('../../config/logging.config', () => ({
  loggingConfig: {
    base: {
      excludePaths: [
        '/.well-known/appspecific/com.chrome.devtools.json',
        '/favicon.ico',
        '*.js.map',
        '*.css.map',
        '/api/*/test' // Add a pattern that contains * but doesn't start with *.
      ]
    },
    monitoring: {
      enabled: true,
      alerting: {
        enabled: true,
        thresholds: {
          responseTime: 1000
        }
      }
    },
    audit: {
      enabled: true
    }
  }
}));

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
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
      providers: [
        LoggerMiddleware,
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware);

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      id: 'test-request-id',
      get: jest.fn().mockReturnValue('test-user-agent'),
      user: { id: 'user-123' }
    };

    mockResponse = {
      statusCode: 200,
      get: jest.fn().mockReturnValue('1024'),
      on: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set context to LoggerMiddleware', () => {
      expect(mockLogger.setContext).toHaveBeenCalledWith('LoggerMiddleware');
    });
  });

  describe('shouldExcludePath', () => {
    it('should exclude exact path matches', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test exact matches
      expect((middleware as any).shouldExcludePath('/favicon.ico')).toBe(true);
      expect((middleware as any).shouldExcludePath('/.well-known/appspecific/com.chrome.devtools.json')).toBe(true);
      expect((middleware as any).shouldExcludePath('/test')).toBe(false);
    });

    it('should exclude paths with extension patterns', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test extension patterns
      expect((middleware as any).shouldExcludePath('/test.js.map')).toBe(true);
      expect((middleware as any).shouldExcludePath('/styles.css.map')).toBe(true);
      expect((middleware as any).shouldExcludePath('/test.js')).toBe(false);
    });

    it('should return false for patterns that do not match any exclusion rules', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test patterns that don't match any exclusion rules
      expect((middleware as any).shouldExcludePath('/some/random/path')).toBe(false);
      expect((middleware as any).shouldExcludePath('/api/users')).toBe(false);
      expect((middleware as any).shouldExcludePath('/static/image.png')).toBe(false);
    });

    it('should return false for patterns with * that do not start with *.', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test patterns that contain * but don't start with *.
      // This will trigger the return false on line 59
      // We need to test with a pattern that contains * but doesn't start with *.
      // Since our mock includes '/api/*/test', let's test with a path that doesn't match
      expect((middleware as any).shouldExcludePath('/api/users/test')).toBe(false);
      expect((middleware as any).shouldExcludePath('/api/products/test')).toBe(false);
      
      // Test with a pattern that contains * but doesn't start with *.
      // This should trigger the return false on line 59
      expect((middleware as any).shouldExcludePath('/some/path/with/star')).toBe(false);
    });

    it('should handle complex pattern matching edge cases', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test a path that would match a pattern with * in the middle but not at the start
      // This should trigger the return false on line 59
      expect((middleware as any).shouldExcludePath('/api/users/test')).toBe(false);
      
      // Test with a path that doesn't match any pattern
      expect((middleware as any).shouldExcludePath('/completely/different/path')).toBe(false);
    });

    it('should test edge case for pattern matching with * in middle', () => {
      const middleware = new LoggerMiddleware(mockLogger);
      
      // Test with a path that would trigger the return false on line 59
      // This happens when a pattern contains * but doesn't start with *.
      // We need to test with a path that doesn't match the '/api/*/test' pattern
      expect((middleware as any).shouldExcludePath('/api/users/test')).toBe(false);
      
      // Test with a path that would match a pattern with * in the middle but not at the start
      // This should trigger the return false on line 59
      expect((middleware as any).shouldExcludePath('/api/users/test')).toBe(false);
    });
  });

  describe('use', () => {
    it('should skip logging for excluded paths', () => {
      mockRequest.originalUrl = '/favicon.ico';
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log incoming request for non-excluded paths', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
        requestId: 'test-request-id'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing user agent', () => {
      mockRequest.get = jest.fn().mockReturnValue(undefined);
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        userAgent: '',
        requestId: 'test-request-id'
      });
    });

    it('should log response when finish event is triggered', () => {
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Trigger the finish event
      finishCallback!();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Request completed', {
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        contentLength: '1024',
        requestId: 'test-request-id'
      });
    });

    it('should skip response logging for excluded paths', () => {
      mockRequest.originalUrl = '/favicon.ico';
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Trigger the finish event
      if (finishCallback) {
        finishCallback();
      }
      
      // Should not log response for excluded paths
      expect(mockLogger.info).toHaveBeenCalledTimes(0);
    });

    it('should skip response logging for excluded paths in response handler', () => {
      // This test covers line 110 - the return statement in the response handler
      // when the path should be excluded
      mockRequest.originalUrl = '/favicon.ico';
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Clear any previous calls
      jest.clearAllMocks();
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Trigger the finish event
      if (finishCallback) {
        finishCallback();
      }
      
      // Should not log response for excluded paths (this covers line 110)
      expect(mockLogger.info).toHaveBeenCalledTimes(0);
    });

    it('should handle missing content length', () => {
      mockResponse.get = jest.fn().mockReturnValue(undefined);
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Request completed', {
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        contentLength: 0,
        requestId: 'test-request-id'
      });
    });

    it('should log error rate warning for 5xx status codes', () => {
      mockResponse.statusCode = 500;
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.warn).toHaveBeenCalledWith('High error rate detected', {
        method: 'GET',
        url: '/test',
        status: 500,
        requestId: 'test-request-id'
      });
    });

    it('should log slow response warning when duration exceeds threshold', () => {
      // Mock Date.now to simulate slow response
      const originalDateNow = Date.now;
      let startTime: number;
      Date.now = jest.fn().mockImplementation(() => {
        if (!startTime) {
          startTime = originalDateNow();
          return startTime;
        }
        return startTime + 1500; // 1.5 seconds
      });

      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Slow response detected', {
        method: 'GET',
        url: '/test',
        duration: '1500ms',
        threshold: '1000ms',
        requestId: 'test-request-id'
      });

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should log audit information when audit is enabled', () => {
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.audit).toHaveBeenCalledWith('HTTP Request', {
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
        requestId: 'test-request-id',
        user: 'user-123'
      });
    });

    it('should log anonymous user when user is not present', () => {
      mockRequest.user = undefined;
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.audit).toHaveBeenCalledWith('HTTP Request', {
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
        requestId: 'test-request-id',
        user: 'anonymous'
      });
    });

    it('should handle missing request ID', () => {
      mockRequest.id = undefined;
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      finishCallback!();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Request completed', {
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        contentLength: '1024',
        requestId: undefined
      });
    });
  });

  describe('monitoring scenarios', () => {
    it('should log error rate warning for 4xx status codes', () => {
      mockResponse.statusCode = 400;
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      // 4xx should not trigger error rate warning (only 5xx)
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should log error rate warning for 5xx status codes', () => {
      mockResponse.statusCode = 503;
      let finishCallback: () => void;
      mockResponse.on = jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      if (finishCallback) {
        finishCallback();
      }
      
      expect(mockLogger.warn).toHaveBeenCalledWith('High error rate detected', {
        method: 'GET',
        url: '/test',
        status: 503,
        requestId: 'test-request-id'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing IP address', () => {
      mockRequest.ip = undefined;
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/test',
        ip: undefined,
        userAgent: 'test-user-agent',
        requestId: 'test-request-id'
      });
    });

    it('should handle different HTTP methods', () => {
      const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        mockRequest.method = method;
        jest.clearAllMocks();
        
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
        
        expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
          method,
          url: '/test',
          ip: '127.0.0.1',
          userAgent: 'test-user-agent',
          requestId: 'test-request-id'
        });
      });
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502, 503];
      
      statusCodes.forEach(statusCode => {
        mockResponse.statusCode = statusCode;
        let finishCallback: () => void;
        mockResponse.on = jest.fn().mockImplementation((event, callback) => {
          if (event === 'finish') {
            finishCallback = callback;
          }
        });

        jest.clearAllMocks();
        
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
        if (finishCallback) {
          finishCallback();
        }
        
        expect(mockLogger.info).toHaveBeenCalledWith('Request completed', {
          method: 'GET',
          url: '/test',
          status: statusCode,
          duration: expect.stringMatching(/\d+ms/),
          contentLength: '1024',
          requestId: 'test-request-id'
        });
      });
    });
  });
});
