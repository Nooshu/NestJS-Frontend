import { RemoveLegacyHeadersMiddleware } from './remove-legacy-headers.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('RemoveLegacyHeadersMiddleware', () => {
  let middleware: RemoveLegacyHeadersMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    middleware = new RemoveLegacyHeadersMiddleware();
    mockRequest = {
      path: '/',
      accepts: jest.fn().mockReturnValue(false),
    };
    mockResponse = {
      removeHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue(undefined),
    };
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  const expectLegacyHeadersRemoved = () => {
    expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-DNS-Prefetch-Control');
    expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Permitted-Cross-Domain-Policies');
    expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-XSS-Protection');
    expect(nextFunction).toHaveBeenCalled();
  };

  it('should remove legacy headers when request accepts HTML', () => {
    mockRequest.accepts = jest.fn().mockReturnValue('html');
    mockRequest.path = '/api/something';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expectLegacyHeadersRemoved();
  });

  it('should remove legacy headers when content-type is text/html', () => {
    mockRequest.path = '/api/page';
    mockResponse.getHeader = jest.fn().mockReturnValue('text/html; charset=utf-8');

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expectLegacyHeadersRemoved();
  });

  it('should remove legacy headers for HTML page routes', () => {
    mockRequest.path = '/start';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expectLegacyHeadersRemoved();
  });

  it('should treat missing path as an HTML route', () => {
    mockRequest.path = undefined;

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expectLegacyHeadersRemoved();
  });

  it('should not remove headers for API routes without HTML accept/content-type', () => {
    mockRequest.path = '/api/users';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should not remove headers for health routes without HTML accept/content-type', () => {
    mockRequest.path = '/health';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should not remove headers for static assets without HTML accept/content-type', () => {
    mockRequest.path = '/assets/app.js';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
  });

  it('should not remove headers for dotted non-static paths without HTML accept/content-type', () => {
    mockRequest.path = '/files/report.txt';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
  });

  it.each([
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.webp',
    '.avif',
    '.map',
  ])('should treat %s as a static asset path', (ext) => {
    mockRequest.path = `/file${ext}`;

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
  });

  it('should match static asset extensions case-insensitively', () => {
    mockRequest.path = '/Font.WOFF2';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
  });

  it('should handle content-type header that is not a string-like HTML type', () => {
    mockRequest.path = '/api/data';
    mockResponse.getHeader = jest.fn().mockReturnValue('application/json');

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.removeHeader).not.toHaveBeenCalled();
  });
});
