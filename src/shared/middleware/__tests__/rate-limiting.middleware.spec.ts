import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { RateLimitingMiddleware } from '../rate-limiting.middleware';
import { LoggerService } from '../../../logger/logger.service';

describe('RateLimitingMiddleware', () => {
  let middleware: RateLimitingMiddleware;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    mockLogger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitingMiddleware, { provide: LoggerService, useValue: mockLogger }],
    }).compile();

    middleware = module.get<RateLimitingMiddleware>(RateLimitingMiddleware);

    mockRequest = {
      ip: '127.0.0.1',
      path: '/test',
      method: 'GET',
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
    // Clean up the middleware to prevent hanging tests
    if (middleware) {
      middleware.onModuleDestroy();
    }
  });

  describe('use', () => {
    it('should allow requests within rate limit', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalledWith(429);
    });

    it('should block requests exceeding rate limit', () => {
      // Simulate 60 failed requests to reach the limit
      for (let i = 0; i < 60; i++) {
        const response: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          end: jest.fn(),
          statusCode: 400, // Failed request to trigger counting
          getHeaders: jest.fn().mockReturnValue({}),
        };

        middleware.use(mockRequest as Request, response as Response, mockNext);
        // Simulate response end to trigger counting
        (response.end as jest.Mock)();
      }

      // Now make one more request that should exceed the limit and trigger blocking
      const exceedingResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(mockRequest as Request, exceedingResponse as Response, mockNext);
      // This response end should trigger the blocking logic
      (exceedingResponse.end as jest.Mock)();

      // Now the next request should be blocked
      const blockedResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(mockRequest as Request, blockedResponse as Response, mockNext);

      expect(blockedResponse.status).toHaveBeenCalledWith(429);
      expect(blockedResponse.json).toHaveBeenCalledWith({
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'Rate limit exceeded',
        retryAfter: expect.any(Number),
      });
    });

    it('should apply different limits for auth routes', () => {
      const authRequest = { ...mockRequest, path: '/api/auth/login' };

      // Auth routes have a limit of 5 requests per 15 minutes
      // Make 5 requests to reach the limit
      for (let i = 0; i < 5; i++) {
        const response: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          end: jest.fn(),
          statusCode: 400, // Failed request to trigger counting
          getHeaders: jest.fn().mockReturnValue({}),
        };

        middleware.use(authRequest as Request, response as Response, mockNext);
        // Simulate response end to trigger counting
        (response.end as jest.Mock)();
      }

      // Make the 6th request that should exceed the limit
      const exceedingResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(authRequest as Request, exceedingResponse as Response, mockNext);
      // This should trigger the blocking logic
      (exceedingResponse.end as jest.Mock)();

      // Now the next request should be blocked
      const blockedResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(authRequest as Request, blockedResponse as Response, mockNext);

      expect(blockedResponse.status).toHaveBeenCalledWith(429);
    });

    it('should set rate limit headers', () => {
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400, // Failed request to trigger counting
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(mockRequest as Request, response as Response, mockNext);

      // Simulate response end to trigger header setting
      (response.end as jest.Mock)();

      expect(response.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': expect.any(String),
          'X-RateLimit-Remaining': expect.any(String),
          'X-RateLimit-Reset': expect.any(String),
        })
      );
    });

    it('should use IP and user agent for client identification', () => {
      const request1 = { ...mockRequest, ip: '192.168.1.1' };
      const request2 = { ...mockRequest, ip: '192.168.1.2' };

      // Different IPs should have separate rate limits
      for (let i = 0; i < 30; i++) {
        middleware.use(request1 as Request, mockResponse as Response, mockNext);
        middleware.use(request2 as Request, mockResponse as Response, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(60);
      expect(mockResponse.status).not.toHaveBeenCalledWith(429);
    });

    it('should handle forwarded headers correctly', () => {
      mockRequest.headers = {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        'user-agent': 'test-agent',
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', () => {
      // Create a response and make a request to create an entry
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400, // Failed request to trigger counting
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(mockRequest as Request, response as Response, mockNext);
      (response.end as jest.Mock)(); // Trigger counting to create an entry

      // Fast-forward time to make the entry expire (past the window + block duration)
      jest.advanceTimersByTime(65 * 60 * 1000); // 65 minutes (past 60min window + 2min block)

      // Fast-forward to trigger cleanup interval
      jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes for cleanup interval

      // The cleanup should have been called and logged
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Cleaned up'));
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear cleanup interval on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      middleware.onModuleDestroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('api config and window resets', () => {
    it('should use /api config for API routes', () => {
      const apiRequest = { ...mockRequest, path: '/api/users' };
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 400,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(apiRequest as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      expect(response.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '100',
        })
      );
    });

    it('should reset blocked entry when window expires in isBlocked', () => {
      const key = 'default:127.0.0.1:hash';
      const now = Date.now();
      (middleware as any).store[key] = {
        count: 100,
        resetTime: now - 1000,
        blocked: true,
        blockUntil: now - 500,
      };

      const config = (middleware as any).configs.default;
      const blocked = (middleware as any).isBlocked(key, config);
      expect(blocked).toBe(false);
      expect((middleware as any).store[key].count).toBe(0);
      expect((middleware as any).store[key].blocked).toBe(false);
    });

    it('should reset counter when window expires in incrementCounter', () => {
      const key = 'reset-key';
      const now = Date.now();
      (middleware as any).store[key] = {
        count: 10,
        resetTime: now - 1000,
        blocked: true,
        blockUntil: now - 500,
      };

      const config = (middleware as any).configs.default;
      const result = (middleware as any).incrementCounter(key, config);
      expect(result.count).toBe(1);
      expect(result.blocked).toBe(false);
    });

    it('should fall back client identifiers when headers missing', () => {
      const req = {
        ...mockRequest,
        ip: undefined,
        headers: {},
        connection: { remoteAddress: undefined },
      };
      middleware.use(req as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use x-real-ip when forwarded is absent', () => {
      const req = {
        ...mockRequest,
        headers: { 'x-real-ip': '10.0.0.5', 'user-agent': 'ua' },
      };
      middleware.use(req as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('cleanup keeps entries still blocked', () => {
      const key = 'still-blocked';
      const now = Date.now();
      (middleware as any).store[key] = {
        count: 1,
        resetTime: now - 1000,
        blocked: true,
        blockUntil: now + 60_000,
      };
      (middleware as any).cleanup();
      expect((middleware as any).store[key]).toBeDefined();
    });

    it('blocked request without blockUntil uses default retryAfter', () => {
      const key = 'default:forced';
      const config = (middleware as any).configs.default;
      const forcedKey = config.keyGenerator(mockRequest);
      (middleware as any).store[forcedKey] = {
        count: 100,
        resetTime: Date.now() + 60_000,
        blocked: true,
        blockUntil: undefined,
      };
      jest.spyOn(middleware as any, 'isBlocked').mockReturnValue(true);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ retryAfter: 60 })
      );
    });
  });

  describe('shouldCount and destroy branches', () => {
    it('does not count successful requests when skipSuccessfulRequests is true', () => {
      const apiRequest = { ...mockRequest, path: '/api/items' };
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 200,
        getHeaders: jest.fn().mockReturnValue({}),
      };

      middleware.use(apiRequest as Request, response as Response, mockNext);
      (response.end as jest.Mock)();

      // API config skips successful requests — no rate limit headers from increment
      expect(response.set).not.toHaveBeenCalled();
    });

    it('does not count failed requests when skipFailedRequests is true', () => {
      const config = (middleware as any).configs.default;
      config.skipFailedRequests = true;
      config.skipSuccessfulRequests = false;
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
        statusCode: 500,
        getHeaders: jest.fn().mockReturnValue({}),
      };
      middleware.use(mockRequest as Request, response as Response, mockNext);
      (response.end as jest.Mock)();
      expect(response.set).not.toHaveBeenCalled();
      config.skipFailedRequests = false;
      config.skipSuccessfulRequests = true;
    });

    it('onModuleDestroy is safe when cleanupInterval is cleared', () => {
      (middleware as any).cleanupInterval = undefined;
      expect(() => middleware.onModuleDestroy()).not.toThrow();
    });

    it('ignores subsequent res.end calls after the first interception', () => {
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        statusCode: 200,
        getHeaders: jest.fn().mockReturnValue({}),
      };
      const config = (middleware as any).configs.default;
      config.skipSuccessfulRequests = false;

      middleware.use(mockRequest as Request, response as Response, mockNext);
      (response.end as jest.Mock)();
      (response.end as jest.Mock)();

      expect(response.set).toHaveBeenCalledTimes(1);
      config.skipSuccessfulRequests = true;
    });
  });
});
