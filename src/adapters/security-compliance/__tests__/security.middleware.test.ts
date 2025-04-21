import express from 'express';
import request from 'supertest';
import { applyGovernmentSecurity, securityMiddleware } from '../security.middleware';
import { mockSecurityConfig } from './test.config';
import { Request, Response, NextFunction, Application } from 'express';
import { SecurityConfig } from '../security.types';
import { RateLimit, MaxValueFn } from 'express-rate-limit';

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
      applyGovernmentSecurity(app, mockSecurityConfig as Required<SecurityConfig>);
      expect(app.use).toHaveBeenCalled();
    });
  });

  describe('securityMiddleware', () => {
    it('should handle password validation', () => {
      const middlewares = securityMiddleware(mockSecurityConfig as Required<SecurityConfig>);
      const passwordMiddleware = middlewares.find(m => 
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
      const middlewares = securityMiddleware(mockSecurityConfig as Required<SecurityConfig>);
      const dataProtectionMiddleware = middlewares.find(m => 
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
      const middlewares = securityMiddleware(mockSecurityConfig as Required<SecurityConfig>);
      const auditMiddleware = middlewares.find(m => 
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

  describe('Helmet Security Headers', () => {
    it('should apply security headers', async () => {
      const response = await request(app).get('/test');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from configured origin', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should not allow requests from unconfigured origin', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://malicious.com');
      
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Make requests up to the limit
      for (let i = 0; i < mockSecurityConfig.rateLimit.max; i++) {
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
      }
    });

    it('should block requests exceeding rate limit', async () => {
      // Exceed the rate limit
      for (let i = 0; i < mockSecurityConfig.rateLimit.max + 1; i++) {
        const response = await request(app).get('/test');
        if (i >= mockSecurityConfig.rateLimit.max) {
          expect(response.status).toBe(429);
        }
      }
    });
  });

  describe('Password Policy', () => {
    it('should validate password strength', async () => {
      const weakPassword = 'password123';
      const strongPassword = 'StrongP@ssw0rd';

      app.post('/validate-password', (req, res) => {
        const { password } = req.body;
        if (password.length < mockSecurityConfig.passwordPolicy.minLength) {
          return res.status(400).json({ error: 'Password too short' });
        }
        res.status(200).json({ valid: true });
      });

      const weakResponse = await request(app)
        .post('/validate-password')
        .send({ password: weakPassword });
      
      const strongResponse = await request(app)
        .post('/validate-password')
        .send({ password: strongPassword });

      expect(weakResponse.status).toBe(400);
      expect(strongResponse.status).toBe(200);
    });
  });

  describe('Data Protection', () => {
    it('should mask sensitive data', async () => {
      app.post('/data', (req, res) => {
        const data = {
          username: 'testuser',
          password: 'secret123',
        };
        res.json(data);
      });

      const response = await request(app).post('/data');
      
      expect(response.body.password).toBe('********');
      expect(response.body.username).toBe('testuser');
    });
  });

  it('should apply rate limiting', async () => {
    const middleware = securityMiddleware(mockSecurityConfig);
    const rateLimitMiddleware = middleware[0];
    
    // Test rate limit
    for (let i = 0; i < mockSecurityConfig.rateLimit.max; i++) {
      await new Promise<void>((resolve) => {
        rateLimitMiddleware(mockRequest as Request, mockResponse as Response, () => {
          mockNext();
          resolve();
        });
      });
    }

    // Test rate limit exceeded
    await new Promise<void>((resolve) => {
      rateLimitMiddleware(mockRequest as Request, mockResponse as Response, (err) => {
        expect(err).toBeDefined();
        resolve();
      });
    });
  });

  it('should apply CORS configuration', () => {
    const middleware = securityMiddleware(mockSecurityConfig);
    const corsMiddleware = middleware[1];
    
    corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should apply Helmet security headers', () => {
    const middleware = securityMiddleware(mockSecurityConfig);
    const helmetMiddleware = middleware[2];
    
    helmetMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
}); 