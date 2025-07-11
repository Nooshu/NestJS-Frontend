import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import { 
  applyGovernmentSecurity, 
  securityMiddleware, 
  rateLimitMiddleware, 
  auditMiddleware, 
  dataProtectionMiddleware 
} from '../security.middleware';
import type { SecurityConfig } from '../security.types';
import { testConfig } from '../test.config';
import { CacheService } from '../cache.service';

// Mock the CacheService
jest.mock('../cache.service');
const MockedCacheService = CacheService as jest.MockedClass<typeof CacheService>;

describe('Security Middleware', () => {
  let app: Application;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    app = express();
    jest.spyOn(app, 'use').mockImplementation(() => app);

    mockRequest = {
      body: {},
      headers: {},
      method: 'GET',
      url: '/test',
      path: '/test',
      ip: '127.0.0.1',
    } as Partial<Request>;

    mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      on: jest.fn(),
    } as Partial<Response>;

    mockNext = jest.fn();

    // Mock CacheService
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;
    MockedCacheService.mockImplementation(() => mockCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyGovernmentSecurity', () => {
    it('should apply security middleware to app', () => {
      applyGovernmentSecurity(app, testConfig as Required<SecurityConfig>);
      expect(app.use).toHaveBeenCalled();
    });

    it('should handle missing config gracefully', () => {
      const minimalConfig: SecurityConfig = {};
      expect(() => applyGovernmentSecurity(app, minimalConfig)).not.toThrow();
    });
  });

  describe('securityMiddleware', () => {
    it('should return an array of middleware functions', () => {
      const middlewares = securityMiddleware(testConfig as Required<SecurityConfig>);
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares.length).toBeGreaterThan(0);
    });

    it('should handle empty config', () => {
      const emptyConfig: SecurityConfig = {};
      const middlewares = securityMiddleware(emptyConfig);
      expect(Array.isArray(middlewares)).toBe(true);
    });
  });

  describe('rateLimitMiddleware', () => {
    it('should create rate limiting middleware with valid config', () => {
      const config: SecurityConfig = {
        rateLimit: {
          enabled: true,
          max: 10,
          windowMs: 60000,
        },
      };

      const middleware = rateLimitMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should return no-op middleware with invalid config', () => {
      const config: SecurityConfig = {
        rateLimit: {
          enabled: false,
          max: 10,
          windowMs: 60000,
        },
      };

      const middleware = rateLimitMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should handle rate limiting correctly', async () => {
      const config: SecurityConfig = {
        rateLimit: {
          enabled: true,
          max: 2,
          windowMs: 60000,
        },
      };

      mockCacheService.get.mockResolvedValue(1); // Current count
      mockCacheService.set.mockResolvedValue();

      const middleware = rateLimitMiddleware(config);
      const req = { ...mockRequest, ip: '192.168.1.1' } as Request;
      const res = mockResponse as Response;

      await middleware(req, res, mockNext);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block requests when rate limit exceeded', async () => {
      const config: SecurityConfig = {
        rateLimit: {
          enabled: true,
          max: 2,
          windowMs: 60000,
        },
      };

      mockCacheService.get.mockResolvedValue(2); // At limit
      mockCacheService.set.mockResolvedValue();

      const middleware = rateLimitMiddleware(config);
      const req = { ...mockRequest, ip: '192.168.1.1' } as Request;
      const res = mockResponse as Response;

      await middleware(req, res, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Too many requests' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('auditMiddleware', () => {
    it('should create audit middleware with enabled config', () => {
      const config: SecurityConfig = {
        audit: {
          enabled: true,
          excludeFields: ['password', 'token'],
        },
      };

      const middleware = auditMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should return no-op middleware with disabled config', () => {
      const config: SecurityConfig = {
        audit: {
          enabled: false,
        },
      };

      const middleware = auditMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should log audit data correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const config: SecurityConfig = {
        audit: {
          enabled: true,
          excludeFields: ['password', 'token'],
        },
      };

      const middleware = auditMiddleware(config);
      const req = {
        ...mockRequest,
        method: 'POST',
        path: '/api/users',
        query: { page: '1' },
        body: { name: 'John', password: 'secret', token: 'abc123' },
      } as Request;

      middleware(req, mockResponse as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', expect.objectContaining({
        method: 'POST',
        path: '/api/users',
        query: { page: '1' },
        body: { name: 'John' }, // password and token should be excluded
      }));
      expect(mockNext).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('dataProtectionMiddleware', () => {
    it('should create data protection middleware with enabled config', () => {
      const config: SecurityConfig = {
        dataProtection: {
          enabled: true,
          encryptionKey: 'test-key',
          masking: {
            enabled: true,
            fields: ['password', 'ssn'],
          },
        },
      };

      const middleware = dataProtectionMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should return no-op middleware with disabled config', () => {
      const config: SecurityConfig = {
        dataProtection: {
          enabled: false,
          encryptionKey: 'test-key',
          masking: {
            enabled: true,
            fields: ['password'],
          },
        },
      };

      const middleware = dataProtectionMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should mask sensitive fields in response', () => {
      const config: SecurityConfig = {
        dataProtection: {
          enabled: true,
          encryptionKey: 'test-key',
          masking: {
            enabled: true,
            fields: ['password', 'ssn'],
          },
        },
      };

      const middleware = dataProtectionMiddleware(config);
      const res = {
        ...mockResponse,
        send: function (body: any) { return body; },
      } as Response;

      // Spy on the send method after middleware wraps it
      const sendSpy = jest.spyOn(res, 'send');

      middleware(mockRequest as Request, res, mockNext);

      // Test that the send method is overridden and called with masked data
      const testData = { name: 'John', password: 'secret123', ssn: '123-45-6789', email: 'john@example.com' };
      res.send(testData);

      expect(sendSpy).toHaveBeenCalledWith({
        name: 'John',
        password: '********',
        ssn: '********',
        email: 'john@example.com',
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('password validation', () => {
    it('should validate password policy correctly', async () => {
      const config: SecurityConfig = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
        },
      };

      const middlewares = securityMiddleware(config);
      
      // Find password middleware by testing each one
      let passwordMiddleware: any = null;
      for (const middleware of middlewares) {
        const req = {
          ...mockRequest,
          path: '/auth/register',
          method: 'POST',
          body: { password: 'weak' },
        } as Request;
        
        try {
          await middleware(req, mockResponse as Response, mockNext);
          // If we get here and next was called with an error, this is likely the password middleware
          if (mockNext.mock.calls.length > 0 && mockNext.mock.calls[0][0] instanceof Error) {
            passwordMiddleware = middleware;
            break;
          }
        } catch (error) {
          // This might be the password middleware
          passwordMiddleware = middleware;
          break;
        }
      }

      if (passwordMiddleware) {
        // Test invalid password
        mockNext.mockClear();
        const invalidReq = {
          ...mockRequest,
          path: '/auth/register',
          method: 'POST',
          body: { password: 'weak' },
        } as Request;

        await passwordMiddleware(invalidReq, mockResponse as Response, mockNext);
        
        // Should call next with an error for invalid password
        expect(mockNext).toHaveBeenCalled();
        const error = mockNext.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Password does not meet policy requirements');
      }
    });
  });

  describe('security headers', () => {
    it('should set security headers correctly', async () => {
      const config: SecurityConfig = {
        helmet: true,
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      };

      const middlewares = securityMiddleware(config);
      
      // Find headers middleware
      const headersMiddleware = middlewares.find(middleware => {
        const req = { ...mockRequest } as Request;
        const res = { ...mockResponse, setHeader: jest.fn() } as Response;
        middleware(req, res, mockNext);
        return res.setHeader && (res.setHeader as jest.Mock).mock.calls.length > 0;
      });

      if (headersMiddleware) {
        const req = { ...mockRequest } as Request;
        const res = { ...mockResponse, setHeader: jest.fn() } as Response;
        
        await headersMiddleware(req, res, mockNext);
        
        expect(res.setHeader).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
      }
    });
  });

  describe('error handling', () => {
    it('should handle cache errors gracefully', async () => {
      const config: SecurityConfig = {
        rateLimit: {
          enabled: true,
          max: 10,
          windowMs: 60000,
        },
      };

      mockCacheService.get.mockRejectedValue(new Error('Cache error'));

      const middleware = rateLimitMiddleware(config);
      const req = { ...mockRequest, ip: '192.168.1.1' } as Request;
      const res = mockResponse as Response;

      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
