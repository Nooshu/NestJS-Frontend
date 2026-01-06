import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { SecurityHeadersMiddleware } from './security-headers.middleware';
import { SecurityConfig } from '../config/security.config';
import { LoggerService } from '../../logger/logger.service';

describe('SecurityHeadersMiddleware', () => {
  let middleware: SecurityHeadersMiddleware;
  let securityConfig: SecurityConfig;
  let loggerService: LoggerService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const mockSecurityConfig = {
      csp: {
        enabled: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    };

    const mockLoggerService = {
      setContext: jest.fn().mockReturnThis(),
      debug: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityHeadersMiddleware,
        {
          provide: SecurityConfig,
          useValue: mockSecurityConfig,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    middleware = module.get<SecurityHeadersMiddleware>(SecurityHeadersMiddleware);
    securityConfig = module.get<SecurityConfig>(SecurityConfig);
    loggerService = module.get<LoggerService>(LoggerService);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock objects - use API route to avoid HTML response detection
    mockRequest = {
      path: '/api/test',
      method: 'GET',
      secure: false,
      headers: {},
      accepts: jest.fn().mockReturnValue(false),
    };

    mockResponse = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue(undefined),
    };

    mockNext = jest.fn();
  });

  describe('Basic Security Headers', () => {
    it('should set basic security headers', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=()'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cross-Origin-Resource-Policy',
        'same-site'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Download-Options', 'noopen');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Security-Enhanced', 'true');
    });

    it('should remove server information headers', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(mockResponse.removeHeader).toHaveBeenCalledWith('Server');
    });

    it('should set comprehensive permissions policy', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      const permissionsPolicyCall = (mockResponse.setHeader as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Permissions-Policy'
      );
      expect(permissionsPolicyCall).toBeDefined();

      const permissionsPolicy = permissionsPolicyCall[1];
      expect(permissionsPolicy).toBe('geolocation=(), microphone=(), camera=()');
    });
  });

  describe('HSTS Headers', () => {
    it('should set HSTS headers for secure requests', () => {
      mockRequest.secure = true;
      mockRequest.path = '/api/test'; // Use API route to avoid HTML detection

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should set HSTS headers for forwarded HTTPS requests', () => {
      mockRequest.headers = { 'x-forwarded-proto': 'https' };
      mockRequest.path = '/api/test'; // Use API route to avoid HTML detection

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should not set HSTS headers for non-secure requests', () => {
      mockRequest.secure = false;
      mockRequest.headers = {};

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });
  });

  describe('Sensitive Routes', () => {
    const sensitiveRoutes = [
      '/api/users',
      '/auth/login',
      '/login',
      '/logout',
      '/admin/dashboard',
      '/dashboard',
      '/profile/settings',
      '/settings',
      '/account/profile',
    ];

    sensitiveRoutes.forEach((route) => {
      it(`should set no-cache headers for sensitive route: ${route}`, () => {
        mockRequest.path = route;
        mockRequest.accepts = jest.fn().mockReturnValue(false); // Ensure it's not detected as HTML

        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Expires', '0');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Surrogate-Control', 'no-store');
        expect(loggerService.debug).toHaveBeenCalledWith(
          'Applied no-cache headers to sensitive route',
          {
            path: route,
            method: mockRequest.method,
          }
        );
      });
    });

    it('should not set no-cache headers for non-sensitive routes', () => {
      mockRequest.path = '/public/info';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      expect(loggerService.debug).not.toHaveBeenCalledWith(
        'Applied no-cache headers to sensitive route',
        expect.any(Object)
      );
    });
  });

  describe('API Routes', () => {
    it('should set enhanced headers for API routes', () => {
      mockRequest.path = '/api/users';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Robots-Tag',
        'noindex, nofollow, nosnippet, noarchive'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Permitted-Cross-Domain-Policies',
        'none'
      );
    });

    it('should set rate limiting headers for API routes when not already set', () => {
      mockRequest.path = '/api/data';
      mockResponse.getHeader = jest.fn().mockReturnValue(undefined);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99');
    });

    it('should not override existing rate limiting headers for API routes', () => {
      mockRequest.path = '/api/data';
      mockResponse.getHeader = jest.fn().mockReturnValue('50');

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('X-RateLimit-Remaining', '99');
    });
  });

  describe('CSP Headers', () => {
    it('should set CSP headers for non-HTML responses', () => {
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false); // Ensure it's not detected as HTML

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
      expect(loggerService.debug).toHaveBeenCalledWith(
        'Applied CSP headers',
        expect.objectContaining({
          path: '/api/test',
          csp: expect.stringContaining("default-src 'self'"),
        })
      );
    });

    it('should set CSP headers when request does not accept HTML', () => {
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.any(String)
      );
    });

    it('should not set CSP headers when CSP is disabled', async () => {
      const disabledCspConfig = {
        csp: {
          enabled: false,
          directives: {},
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SecurityHeadersMiddleware,
          {
            provide: SecurityConfig,
            useValue: disabledCspConfig,
          },
          {
            provide: LoggerService,
            useValue: loggerService,
          },
        ],
      }).compile();

      const middlewareWithDisabledCsp =
        module.get<SecurityHeadersMiddleware>(SecurityHeadersMiddleware);
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false);

      middlewareWithDisabledCsp.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.any(String)
      );
    });

    it('should format CSP directives correctly', () => {
      mockRequest.path = '/api/test';
      mockRequest.accepts = jest.fn().mockReturnValue(false);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      const cspCall = (mockResponse.setHeader as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Content-Security-Policy'
      );
      expect(cspCall).toBeDefined();

      const cspValue = cspCall[1];
      expect(cspValue).toContain("default-src 'self'");
      expect(cspValue).toContain("script-src 'self' 'unsafe-inline'");
      expect(cspValue).toContain("style-src 'self' 'unsafe-inline'");
      expect(cspValue).toContain("img-src 'self' data: https:");
      expect(cspValue).toContain("object-src 'none'");
    });
  });

  describe('Static Assets', () => {
    const staticAssets = [
      '/assets/style.css',
      '/js/app.js',
      '/images/logo.png',
      '/images/photo.jpg',
      '/images/icon.jpeg',
      '/images/animation.gif',
      '/images/icon.svg',
      '/favicon.ico',
      '/fonts/font.woff',
      '/fonts/font.woff2',
      '/fonts/font.ttf',
      '/fonts/font.eot',
    ];

    staticAssets.forEach((asset) => {
      it(`should set appropriate headers for static asset: ${asset}`, () => {
        mockRequest.path = asset;

        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=31536000, immutable'
        );
      });
    });

    it('should not set static asset headers for non-static files', () => {
      mockRequest.path = '/api/data.json';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=31536000, immutable'
      );
    });
  });

  describe('Helper Methods', () => {
    describe('isSensitiveRoute', () => {
      it('should identify sensitive routes correctly', () => {
        const sensitiveRoutes = [
          '/api/users',
          '/auth/login',
          '/login',
          '/logout',
          '/admin/dashboard',
          '/dashboard',
          '/profile/settings',
          '/settings',
          '/account/profile',
        ];

        sensitiveRoutes.forEach((route) => {
          expect((middleware as any).isSensitiveRoute(route)).toBe(true);
        });
      });

      it('should not identify non-sensitive routes as sensitive', () => {
        const nonSensitiveRoutes = ['/public/info', '/about', '/contact', '/help', '/docs', '/'];

        nonSensitiveRoutes.forEach((route) => {
          expect((middleware as any).isSensitiveRoute(route)).toBe(false);
        });
      });
    });

    describe('isStaticAsset', () => {
      it('should identify static assets correctly', () => {
        const staticAssets = [
          '/style.css',
          '/app.js',
          '/logo.png',
          '/photo.jpg',
          '/icon.jpeg',
          '/animation.gif',
          '/icon.svg',
          '/favicon.ico',
          '/font.woff',
          '/font.woff2',
          '/font.ttf',
          '/font.eot',
        ];

        staticAssets.forEach((asset) => {
          expect((middleware as any).isStaticAsset(asset)).toBe(true);
        });
      });

      it('should not identify non-static files as static assets', () => {
        const nonStaticFiles = [
          '/api/data.json',
          '/users/profile',
          '/dashboard.html',
          '/index',
          '/config.xml',
        ];

        nonStaticFiles.forEach((file) => {
          expect((middleware as any).isStaticAsset(file)).toBe(false);
        });
      });
    });

    describe('kebabCase', () => {
      it('should convert camelCase to kebab-case', () => {
        expect((middleware as any).kebabCase('defaultSrc')).toBe('default-src');
        expect((middleware as any).kebabCase('scriptSrc')).toBe('script-src');
        expect((middleware as any).kebabCase('styleSrc')).toBe('style-src');
        expect((middleware as any).kebabCase('connectSrc')).toBe('connect-src');
        expect((middleware as any).kebabCase('fontSrc')).toBe('font-src');
        expect((middleware as any).kebabCase('objectSrc')).toBe('object-src');
        expect((middleware as any).kebabCase('mediaSrc')).toBe('media-src');
        expect((middleware as any).kebabCase('frameSrc')).toBe('frame-src');
      });

      it('should handle strings without camelCase', () => {
        expect((middleware as any).kebabCase('default')).toBe('default');
        expect((middleware as any).kebabCase('script')).toBe('script');
        expect((middleware as any).kebabCase('')).toBe('');
      });

      it('should handle multiple camelCase conversions', () => {
        expect((middleware as any).kebabCase('defaultSrcScriptSrc')).toBe('default-src-script-src');
        expect((middleware as any).kebabCase('connectSrcFontSrc')).toBe('connect-src-font-src');
      });
    });
  });

  describe('Middleware Flow', () => {
    it('should call next() after setting headers', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle requests with minimal properties', () => {
      const minimalRequest = {
        path: '/api/test',
        method: 'GET',
        secure: false,
        headers: {},
        accepts: jest.fn().mockReturnValue(false),
      };

      middleware.use(minimalRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.setHeader).toHaveBeenCalled();
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

    it('should handle requests with special characters in path', () => {
      mockRequest.path = '/api/users/123%20test';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate'
      );
    });
  });
});
