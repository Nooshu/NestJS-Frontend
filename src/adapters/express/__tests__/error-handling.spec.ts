import type { Express, NextFunction, Request, Response } from 'express';
import { setupErrorHandling } from '../error-handling';

describe('error-handling.ts', () => {
  let mockApp: Partial<Express>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock Express app
    mockApp = {
      use: jest.fn(),
    };

    // Mock request
    mockReq = {
      url: '/test',
      method: 'GET',
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };

    // Mock next function
    mockNext = jest.fn();

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('setupErrorHandling', () => {
    it('should set up 404 handler', () => {
      // Act
      setupErrorHandling(mockApp as Express);

      // Assert
      expect(mockApp.use).toHaveBeenCalled();
      const middleware = (mockApp.use as jest.Mock).mock.calls[0][0];
      
      // Call the middleware with mock request and response
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Page not found',
        error: {
          status: 404,
          message: 'Page not found',
        },
      });
    });

    it('should set up global error handler', () => {
      // Act
      setupErrorHandling(mockApp as Express);

      // Assert
      expect(mockApp.use).toHaveBeenCalled();
      const errorMiddleware = (mockApp.use as jest.Mock).mock.calls[1][0];
      
      // Test with a generic error
      const error = new Error('Test error');
      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Internal Server Error',
        error: {
          status: 500,
          message: 'Something went wrong',
        },
      });
    });

    it('should handle security errors with 403 status', () => {
      // Act
      setupErrorHandling(mockApp as Express);

      // Assert
      expect(mockApp.use).toHaveBeenCalled();
      const errorMiddleware = (mockApp.use as jest.Mock).mock.calls[1][0];
      
      // Create a security error
      const securityError = new Error('Security violation');
      securityError.name = 'SecurityError';
      
      // Test with security error
      errorMiddleware(securityError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(securityError.stack);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Security Error',
        error: {
          status: 403,
          message: 'Access denied',
        },
      });
    });

    it('should handle errors without stack traces', () => {
      // Act
      setupErrorHandling(mockApp as Express);

      // Assert
      expect(mockApp.use).toHaveBeenCalled();
      const errorMiddleware = (mockApp.use as jest.Mock).mock.calls[1][0];
      
      // Create an error without stack trace
      const error = new Error('Test error');
      delete error.stack;
      
      // Test with error without stack
      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Internal Server Error',
        error: {
          status: 500,
          message: 'Something went wrong',
        },
      });
    });

    it('should handle non-Error objects', () => {
      // Act
      setupErrorHandling(mockApp as Express);

      // Assert
      expect(mockApp.use).toHaveBeenCalled();
      const errorMiddleware = (mockApp.use as jest.Mock).mock.calls[1][0];
      
      // Test with non-Error object
      const nonError = { message: 'Not an error' };
      errorMiddleware(nonError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Internal Server Error',
        error: {
          status: 500,
          message: 'Something went wrong',
        },
      });
    });
  });
}); 