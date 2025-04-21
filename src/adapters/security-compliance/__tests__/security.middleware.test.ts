import express from 'express';
import request from 'supertest';
import { applyGovernmentSecurity, securityMiddleware } from '../security.middleware';
import { testConfig } from '../test.config';
import { Request, Response, NextFunction, Application } from 'express';
import { SecurityConfig } from '../security.types';
import { RateLimit, MaxValueFn } from 'express-rate-limit';
import { rateLimitMiddleware, auditMiddleware, dataProtectionMiddleware } from '../security.middleware';

describe('Security Middleware', () => {
  let app: Application;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    app = express();
    // Mock the app.use method
    jest.spyOn(app, 'use').mockImplementation(() => app);
    
    // Create a new object for each test to avoid readonly property issues
    mockRequest = {
      body: {},
      headers: {},
      method: 'GET',
      url: '/test',
    } as Partial<Request>;
    mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('applyGovernmentSecurity', () => {
    it('should apply security middleware to app', () => {
      applyGovernmentSecurity(app, testConfig as Required<SecurityConfig>);
      expect(app.use).toHaveBeenCalled();
    });
  });

  describe('securityMiddleware', () => {
    it('should handle password validation', () => {
      const middlewares = securityMiddleware(testConfig as Required<SecurityConfig>);
      const passwordMiddleware = middlewares.find((m: (req: Request, res: Response, next: NextFunction) => void) => 
        m.toString().includes('password')
      );

      if (!passwordMiddleware) {
        throw new Error('Password middleware not found');
      }

      // Test invalid password
      const invalidRequest = {
        ...mockRequest,
        url: '/auth/register',
        method: 'POST',
        body: { password: 'weak' },
      } as Request;

      passwordMiddleware(invalidRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Test valid password
      const validRequest = {
        ...mockRequest,
        url: '/auth/register',
        method: 'POST',
        body: { password: 'StrongP@ssw0rd' },
      } as Request;

      mockNext.mockClear();
      passwordMiddleware(validRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle data protection', () => {
      const middlewares = securityMiddleware(testConfig as Required<SecurityConfig>);
      const dataProtectionMiddleware = middlewares.find((m: (req: Request, res: Response, next: NextFunction) => void) => 
        m.toString().includes('data')
      );

      if (!dataProtectionMiddleware) {
        throw new Error('Data protection middleware not found');
      }

      const sensitiveData = { password: 'secret', email: 'test@example.com' };
      const testResponse = {
        ...mockResponse,
        json: jest.fn((data: unknown) => data),
      } as Response;

      dataProtectionMiddleware(mockRequest as Request, testResponse, mockNext);
      const jsonFn = (testResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonFn(sensitiveData).password).toBe('********');
      expect(jsonFn(sensitiveData).email).toBe('test@example.com');
    });

    it('should handle audit logging', () => {
      const middlewares = securityMiddleware(testConfig as Required<SecurityConfig>);
      const auditMiddleware = middlewares.find((m: (req: Request, res: Response, next: NextFunction) => void) => 
        m.toString().includes('audit')
      );

      if (!auditMiddleware) {
        throw new Error('Audit middleware not found');
      }

      const consoleSpy = jest.spyOn(console, 'log');
      const testRequest = {
        ...mockRequest,
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'test-agent',
        },
      } as Request;

      const testResponse = {
        ...mockResponse,
        on: jest.fn().mockImplementation((event: string, callback: () => void) => {
          if (event === 'finish') {
            callback();
          }
        }),
        statusCode: 200,
      } as unknown as Response;

      auditMiddleware(testRequest, testResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
}); 