import { HtmlCacheMiddleware } from './html-cache.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('HtmlCacheMiddleware', () => {
  let middleware: HtmlCacheMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    middleware = new HtmlCacheMiddleware();
    mockRequest = {
      accepts: jest.fn(),
    };
    mockResponse = {
      set: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set cache headers when the request accepts HTML', () => {
    (mockRequest.accepts as jest.Mock).mockReturnValue('html');

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=30'
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should not set cache headers when the request does not accept HTML', () => {
    (mockRequest.accepts as jest.Mock).mockReturnValue(false);

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.set).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });
});
