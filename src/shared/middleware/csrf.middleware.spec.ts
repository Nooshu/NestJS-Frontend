import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { CsrfMiddleware } from './csrf.middleware';
import { ConfigService } from '@nestjs/config';
import { createTestApp } from '../../test/helpers';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let configService: ConfigService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
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
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    middleware = moduleRef.get<CsrfMiddleware>(CsrfMiddleware);
    configService = moduleRef.get<ConfigService>(ConfigService);

    mockRequest = {
      method: 'GET',
      path: '/api/test',
      headers: {},
      cookies: {},
    };

    mockResponse = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe('use', () => {
    it('should generate and set CSRF token for non-excluded paths', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'XSRF-TOKEN',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should validate CSRF token for non-GET requests', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { 'XSRF-TOKEN': 'test-token' };
      mockRequest.headers = { 'x-xsrf-token': 'test-token' };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject invalid CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { 'XSRF-TOKEN': 'test-token' };
      mockRequest.headers = { 'x-xsrf-token': 'invalid-token' };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'Invalid CSRF token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should skip CSRF check for excluded paths', () => {
      (mockRequest as any).path = '/api/auth/login';
      mockRequest.method = 'POST';

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle missing CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = {};
      mockRequest.headers = {};

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        message: 'CSRF token missing',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { 'XSRF-TOKEN': 'test-token' };
      mockRequest.headers = { 'x-xsrf-token': 'test-token' };

      const error = new Error('Test error');
      nextFunction.mockImplementationOnce(() => {
        throw error;
      });

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
}); 