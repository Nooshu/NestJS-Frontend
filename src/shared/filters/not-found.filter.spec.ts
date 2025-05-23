import { NotFoundExceptionFilter } from './not-found.filter';
import { NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { loggingConfig } from '../config/logging.config';

describe('NotFoundExceptionFilter', () => {
  let filter: NotFoundExceptionFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new NotFoundExceptionFilter();
    mockRequest = {
      path: '/test-path',
      url: '/test-path',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  describe('shouldExcludePath', () => {
    it('should return true for exact path matches', () => {
      const testPath = '/favicon.ico';
      loggingConfig.base.excludePaths = ['/favicon.ico'];
      expect(filter['shouldExcludePath'](testPath)).toBe(true);
    });

    it('should return true for extension-based wildcards', () => {
      const testPath = '/static/main.js.map';
      loggingConfig.base.excludePaths = ['*.js.map'];
      expect(filter['shouldExcludePath'](testPath)).toBe(true);
    });

    it('should return false for non-matching paths', () => {
      const testPath = '/some-other-path';
      loggingConfig.base.excludePaths = ['/favicon.ico', '*.js.map'];
      expect(filter['shouldExcludePath'](testPath)).toBe(false);
    });

    it('should handle multiple patterns correctly', () => {
      const testPath = '/static/main.js.map';
      loggingConfig.base.excludePaths = ['/favicon.ico', '*.js.map', '/other-path'];
      expect(filter['shouldExcludePath'](testPath)).toBe(true);
    });
  });

  describe('catch', () => {
    it('should return silent 404 for excluded paths', () => {
      const excludedRequest = {
        ...mockRequest,
        path: '/favicon.ico',
        url: '/favicon.ico',
      };
      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => excludedRequest,
          getResponse: () => mockResponse,
        }),
      };
      loggingConfig.base.excludePaths = ['/favicon.ico'];

      filter.catch(new NotFoundException(), mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return detailed 404 response for non-excluded paths', () => {
      const nonExcludedRequest = {
        ...mockRequest,
        path: '/unknown-page',
        url: '/unknown-page',
      };
      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => nonExcludedRequest,
          getResponse: () => mockResponse,
        }),
      };
      loggingConfig.base.excludePaths = ['/favicon.ico'];

      filter.catch(new NotFoundException(), mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        timestamp: expect.any(String),
        path: '/unknown-page',
        message: 'Not Found',
      });
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should handle extension-based exclusions in catch method', () => {
      const extensionRequest = {
        ...mockRequest,
        path: '/static/main.js.map',
        url: '/static/main.js.map',
      };
      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => extensionRequest,
          getResponse: () => mockResponse,
        }),
      };
      loggingConfig.base.excludePaths = ['*.js.map'];

      filter.catch(new NotFoundException(), mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
}); 