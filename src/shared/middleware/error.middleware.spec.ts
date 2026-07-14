import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMiddleware } from './error.middleware';

describe('ErrorMiddleware', () => {
  let middleware: ErrorMiddleware;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;
  let originalNodeEnv: string | undefined;

  beforeEach(async () => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorMiddleware],
    }).compile();

    middleware = module.get<ErrorMiddleware>(ErrorMiddleware);

    mockRequest = {
      url: '/test/path',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('use method', () => {
    it('should call next() when no error occurs', () => {
      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle HttpException errors', () => {
      const httpError = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      mockNext.mockImplementation(() => {
        throw httpError;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        timestamp: expect.any(String),
        path: '/test/path',
      });
    });

    it('should handle generic Error objects', () => {
      const genericError = new Error('Something went wrong');
      mockNext.mockImplementation(() => {
        throw genericError;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        timestamp: expect.any(String),
        path: '/test/path',
      });
    });

    it('should handle non-Error objects', () => {
      mockNext.mockImplementation(() => {
        throw 'String error';
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: expect.any(String),
        path: '/test/path',
      });
    });

    it('should handle null/undefined errors', () => {
      mockNext.mockImplementation(() => {
        throw null;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: expect.any(String),
        path: '/test/path',
      });
    });

    it('should include stack trace in development environment', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      error.stack = 'Error: Development error\n    at test.js:1:1';
      mockNext.mockImplementation(() => {
        throw error;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json.mock.calls[0][0].stack).toBe(
        'Error: Development error\n    at test.js:1:1'
      );
    });

    it('should use fallback stack message for Error without stack in development', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('No stack');
      error.stack = undefined;
      mockNext.mockImplementation(() => {
        throw error;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json.mock.calls[0][0].stack).toBe('No stack trace available');
    });

    it('should use fallback stack for non-Error throwables in development', () => {
      process.env.NODE_ENV = 'development';
      mockNext.mockImplementation(() => {
        throw 'string error';
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json.mock.calls[0][0].stack).toBe('No stack trace available');
    });

    it('should not include stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      error.stack = 'Error: Production error\n    at test.js:1:1';
      mockNext.mockImplementation(() => {
        throw error;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json.mock.calls[0][0].stack).toBeUndefined();
    });

    it('should handle different request URLs', () => {
      mockRequest.url = '/api/users/123';

      const error = new Error('Test error');
      mockNext.mockImplementation(() => {
        throw error;
      });

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Test error',
        timestamp: expect.any(String),
        path: '/api/users/123',
      });
    });
  });
});
