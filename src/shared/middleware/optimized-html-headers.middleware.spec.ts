import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { OptimizedHtmlHeadersMiddleware } from './optimized-html-headers.middleware';

describe('OptimizedHtmlHeadersMiddleware', () => {
  let middleware: OptimizedHtmlHeadersMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptimizedHtmlHeadersMiddleware],
    }).compile();

    middleware = module.get<OptimizedHtmlHeadersMiddleware>(OptimizedHtmlHeadersMiddleware);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock objects
    mockRequest = {
      path: '/',
      method: 'GET',
      headers: {
        'accept-encoding': 'gzip, deflate, br',
      },
      accepts: jest.fn().mockReturnValue('html'),
    };

    mockResponse = {
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue(undefined),
      end: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('HTML Response Detection', () => {
    it('should detect HTML responses correctly', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Encoding', 'br');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' https:; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'same-site');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Alt-Svc', 'h3=":443"; ma=86400');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Priority', 'u=0');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Server', 'cloudflare');
    });

    it('should not set headers for non-HTML responses', () => {
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should detect HTML responses by content-type', () => {
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false);
      mockResponse.getHeader = jest.fn().mockReturnValue('text/html');

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalled();
    });

    it('should detect HTML responses by route pattern', () => {
      mockRequest.path = '/';
      mockRequest.accepts = jest.fn().mockReturnValue(false);
      mockResponse.getHeader = jest.fn().mockReturnValue(undefined);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalled();
    });
  });

  describe('Header Values', () => {
    it('should set correct cache control headers', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600'
      );
    });

    it('should set Brotli encoding when supported', () => {
      mockRequest.headers = { 'accept-encoding': 'gzip, deflate, br' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Encoding', 'br');
    });

    it('should not set Brotli encoding when not supported', () => {
      mockRequest.headers = { 'accept-encoding': 'gzip, deflate' };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Content-Encoding', 'br');
    });

    it('should set comprehensive CSP headers', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' https:; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests"
      );
    });
  });

  describe('ETag Generation', () => {
    it('should generate ETag for responses', () => {
      const originalEnd = jest.fn();
      mockResponse.end = originalEnd;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response end with content
      const endFunction = mockResponse.end as jest.Mock;
      endFunction('test content');

      expect(mockResponse.setHeader).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });
  });

  describe('Static Asset Detection', () => {
    it('should not treat static assets as HTML responses', () => {
      const staticPaths = [
        '/assets/style.css',
        '/js/app.js',
        '/images/logo.png',
        '/fonts/font.woff2',
      ];

      staticPaths.forEach(path => {
        jest.clearAllMocks();
        mockRequest.path = path;
        mockRequest.accepts = jest.fn().mockReturnValue(false);

        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.setHeader).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with undefined path', () => {
      mockRequest.path = undefined as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle requests with empty path', () => {
      mockRequest.path = '';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle missing accept-encoding header', () => {
      mockRequest.headers = {};

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Content-Encoding', 'br');
    });
  });
});
