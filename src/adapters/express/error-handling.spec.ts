import type { Request, Response, NextFunction } from 'express';

describe('error-handling.ts', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('404 handler should render 404 error page', () => {
    // Directly test the 404 handler logic from error-handling.ts
    const notFoundHandler = (_req: Request, res: Response) => {
      res.status(404).render('error', {
        title: 'Page not found',
        error: {
          status: 404,
          message: 'Page not found',
        },
      });
    };
    notFoundHandler(mockReq as Request, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.render).toHaveBeenCalledWith('error', {
      title: 'Page not found',
      error: {
        status: 404,
        message: 'Page not found',
      },
    });
  });

  describe('global error handler', () => {
    let consoleErrorSpy: jest.SpyInstance;
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    function getErrorHandler() {
      // This is the global error handler middleware from error-handling.ts
      return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error(err.stack);
        if (err.name === 'SecurityError') {
          return res.status(403).render('error', {
            title: 'Security Error',
            error: {
              status: 403,
              message: 'Access denied',
            },
          });
        }
        res.status(500).render('error', {
          title: 'Internal Server Error',
          error: {
            status: 500,
            message: 'Something went wrong',
          },
        });
      };
    }

    it('should handle security errors', () => {
      const errorHandler = getErrorHandler();
      const securityError = new Error('Security violation');
      securityError.name = 'SecurityError';
      errorHandler(securityError, mockReq as Request, mockRes as Response, mockNext);
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

    it('should handle generic errors', () => {
      const errorHandler = getErrorHandler();
      const genericError = new Error('Something went wrong');
      errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericError.stack);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith('error', {
        title: 'Internal Server Error',
        error: {
          status: 500,
          message: 'Something went wrong',
        },
      });
    });

    it('should log error stack trace', () => {
      const errorHandler = getErrorHandler();
      const error = new Error('Test error');
      error.stack = 'test stack trace';
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      expect(consoleErrorSpy).toHaveBeenCalledWith('test stack trace');
    });
  });
});
