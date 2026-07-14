import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SecurityErrorFilter } from './security-error.filter';

describe('SecurityErrorFilter', () => {
  let filter: SecurityErrorFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockHost: ArgumentsHost;
  let consoleErrorSpy: jest.SpyInstance;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    filter = new SecurityErrorFilter();

    mockRequest = {
      url: '/test-path',
      method: 'GET',
    };
    mockResponse = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('shouldExcludePath', () => {
    it('should exclude exact path matches', () => {
      expect(filter['shouldExcludePath']('/favicon.ico')).toBe(true);
      expect(filter['shouldExcludePath']('/.well-known/appspecific/com.chrome.devtools.json')).toBe(
        true
      );
    });

    it('should exclude *.js.map and *.css.map paths', () => {
      expect(filter['shouldExcludePath']('/static/main.js.map')).toBe(true);
      expect(filter['shouldExcludePath']('/styles/app.css.map')).toBe(true);
    });

    it('should return false for non-matching paths', () => {
      expect(filter['shouldExcludePath']('/unknown')).toBe(false);
    });

    it('should return false for wildcard patterns that are not *.extension', () => {
      (filter as unknown as { excludePaths: string[] }).excludePaths.push('prefix*suffix');
      expect(filter['shouldExcludePath']('/anything')).toBe(false);
    });
  });

  describe('catch', () => {
    it('should skip processing for excluded paths', () => {
      mockRequest.url = '/favicon.ico';

      filter.catch(new Error('ignored'), mockHost);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should sanitize HttpException in development including stack', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Security Error:',
        expect.objectContaining({
          path: '/test-path',
          method: 'GET',
          error: 'Forbidden',
          status: HttpStatus.FORBIDDEN,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          path: '/test-path',
          timestamp: expect.any(String),
          stack: expect.any(String),
        })
      );
    });

    it('should hide stack traces for HttpException in production', () => {
      process.env.NODE_ENV = 'production';
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'No stack trace available',
        })
      );
    });

    it('should sanitize generic Error instances', () => {
      const exception = new Error('boom');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'boom',
          stack: expect.any(String),
        })
      );
    });

    it('should use fallback stack when Error has no stack in development', () => {
      const exception = new Error('no stack');
      exception.stack = undefined;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'No stack trace available',
        })
      );
    });

    it('should hide stack for generic Error in production', () => {
      process.env.NODE_ENV = 'production';

      filter.catch(new Error('secret'), mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'secret',
          stack: 'No stack trace available',
        })
      );
    });

    it('should sanitize unknown non-Error exceptions', () => {
      filter.catch('string-failure', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
          stack: 'No stack trace available',
        })
      );
    });

    it('should not send a response when headers were already sent', () => {
      mockResponse.headersSent = true;

      filter.catch(new Error('late error'), mockHost);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Headers already sent, cannot send error response:',
        expect.objectContaining({
          path: '/test-path',
          method: 'GET',
          error: 'late error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        })
      );
    });
  });
});
