import { HttpException, HttpStatus } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ErrorMiddleware } from './error.middleware';

describe('ErrorMiddleware', () => {
  let middleware: ErrorMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new ErrorMiddleware();
    mockReq = { url: '/test' };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    nextFunction = jest.fn();
  });

  it('should call next() if no error is thrown', () => {
    middleware.use(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should catch an HttpException and return a JSON error response (with status, message, timestamp, path, and (if in development) a stack trace)', () => {
    const httpEx = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    nextFunction.mockImplementation(() => { throw httpEx; });
    middleware.use(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      timestamp: expect.any(String),
      path: '/test',
      stack: expect.any(String) // (if in development, a stack trace is included)
    }));
  });

  it('should catch a generic (non–HttpException) error and return a JSON error response (with status 500, "Internal server error" (or the error's message), timestamp, path, and (if in development) a stack trace)', () => {
    const genericError = new Error('Generic error');
    nextFunction.mockImplementation(() => { throw genericError; });
    middleware.use(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Generic error',
      timestamp: expect.any(String),
      path: '/test',
      stack: expect.any(String) // (if in development, a stack trace is included)
    }));
  });

  it('should catch a generic (non–Error) object and return a JSON error response (with status 500, "Internal server error", timestamp, path, and (if in development) a "No stack trace available" stack)', () => {
    const nonErrorObject = { foo: 'bar' };
    nextFunction.mockImplementation(() => { throw nonErrorObject; });
    middleware.use(mockReq as Request, mockRes as Response, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: '/test',
      stack: 'No stack trace available' // (if in development, a fallback stack is provided)
    }));
  });
}); 