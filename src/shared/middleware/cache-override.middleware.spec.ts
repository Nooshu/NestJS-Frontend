import { CacheOverrideMiddleware } from './cache-override.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('CacheOverrideMiddleware', () => {
  let middleware: CacheOverrideMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    middleware = new CacheOverrideMiddleware();
    mockRequest = { method: 'GET', path: '/' };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should skip non-GET requests', () => {
    mockRequest.method = 'POST';
    mockRequest.path = '/styles.css';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should set immutable cache headers for static assets', () => {
    mockRequest.path = '/assets/app.js';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable, stale-while-revalidate=2592000'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should match static extensions case-insensitively', () => {
    mockRequest.path = '/logo.PNG';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable, stale-while-revalidate=2592000'
    );
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
  ])('should treat %s as a static asset', (ext) => {
    mockRequest.path = `/file${ext}`;

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable, stale-while-revalidate=2592000'
    );
  });

  it('should set HTML cache headers for HTML page routes', () => {
    mockRequest.path = '/find-a-court';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=3600'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
  });

  it('should set HTML cache headers for the root route', () => {
    mockRequest.path = '/';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=3600'
    );
  });

  it('should not set cache headers for API routes', () => {
    mockRequest.path = '/api/users';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should not set cache headers for health routes', () => {
    mockRequest.path = '/health';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should not set cache headers for non-static paths that contain a dot', () => {
    mockRequest.path = '/download/report.txt';

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });
});
