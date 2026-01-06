import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheMiddleware } from './cache.middleware';
import { Request, Response } from 'express';

// Define a type that matches our middleware's expected request type
interface MockRequest extends Partial<Request> {
  method?: string;
  path?: string;
  isAuthenticated?: (() => boolean) | undefined;
}

describe('CacheMiddleware', () => {
  let middleware: CacheMiddleware;
  let configService: ConfigService;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<CacheMiddleware>(CacheMiddleware);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    mockRequest = {};
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('Non-GET requests', () => {
    it('should call next() without setting cache headers for POST requests', () => {
      mockRequest.method = 'POST';
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should call next() without setting cache headers for PUT requests', () => {
      mockRequest.method = 'PUT';
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('API routes', () => {
    it('should call next() without setting cache headers for API routes', () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/api/users';
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('Development environment', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/some-page';
      (configService.get as jest.Mock).mockReturnValue('development');
    });

    it('should set no-cache headers in development environment', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Expires', '0');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Production environment', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/some-page';
      (configService.get as jest.Mock).mockReturnValue('production');
    });

    describe('Authenticated routes', () => {
      it('should call next() without setting cache headers for authenticated routes', () => {
        mockRequest.isAuthenticated = () => true;
        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.setHeader).not.toHaveBeenCalled();
      });
    });

    describe('Unauthenticated routes', () => {
      beforeEach(() => {
        mockRequest.isAuthenticated = () => false;
      });

      it('should set cache headers when isAuthenticated is undefined', () => {
        mockRequest.isAuthenticated = undefined;
        (configService.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'environment') return 'production';
          if (key === 'performance.browserCache.maxAge') return 3600;
          if (key === 'performance.browserCache.pages.maxAge') return 3600;
          if (key === 'performance.browserCache.pages.staleWhileRevalidate') return 60;
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=3600, stale-while-revalidate=60'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      it('should set cache headers with custom duration from config', () => {
        (configService.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'environment') return 'production';
          if (key === 'performance.browserCache.maxAge') return 7200;
          if (key === 'performance.browserCache.pages.maxAge') return 7200;
          if (key === 'performance.browserCache.pages.staleWhileRevalidate') return 120;
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=7200, stale-while-revalidate=120'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      it('should set cache headers with default duration when config is not set', () => {
        (configService.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'environment') return 'production';
          if (key === 'performance.browserCache.maxAge') return null;
          if (key === 'performance.browserCache.pages.maxAge') return null;
          if (key === 'performance.browserCache.pages.staleWhileRevalidate') return null;
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=3600, stale-while-revalidate=60'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      describe('Static assets', () => {
        const staticAssetTests = [
          { path: '/css/main.css', type: 'CSS' },
          { path: '/js/app.js', type: 'JavaScript' },
          { path: '/images/photo.jpg', type: 'JPEG' },
          { path: '/images/icon.png', type: 'PNG' },
          { path: '/images/logo.gif', type: 'GIF' },
          { path: '/favicon.ico', type: 'ICO' },
          { path: '/fonts/custom.woff', type: 'WOFF' },
          { path: '/fonts/custom.woff2', type: 'WOFF2' },
        ];

        staticAssetTests.forEach(({ path, type }) => {
          it(`should set long cache headers for ${type} files`, () => {
            mockRequest.path = path;
            (configService.get as jest.Mock).mockImplementation((key: string) => {
              if (key === 'environment') return 'production';
              if (key === 'performance.browserCache.maxAge') return 3600;
              if (key === 'performance.browserCache.staticAssets.maxAge') return 604800;
              if (key === 'performance.browserCache.staticAssets.staleWhileRevalidate')
                return 86400;
              return null;
            });

            middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockResponse.setHeader).toHaveBeenCalledWith(
              'Cache-Control',
              'public, max-age=604800, stale-while-revalidate=86400'
            );
            expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
            expect(nextFunction).toHaveBeenCalled();
          });
        });
      });

      it('should handle isAuthenticated function throwing an error', () => {
        mockRequest.isAuthenticated = () => {
          throw new Error('Auth check failed');
        };

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        // Should still set cache headers as if unauthenticated
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          expect.stringContaining('public, max-age=')
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      it('should handle config service throwing an error', () => {
        (configService.get as jest.Mock).mockImplementation(() => {
          throw new Error('Config error');
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

        // Should use default values when config fails
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=3600, stale-while-revalidate=60'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });
    });
  });

  describe('Other environments', () => {
    beforeEach(() => {
      mockRequest.method = 'GET';
      mockRequest.path = '/some-page';
      mockRequest.isAuthenticated = () => false;
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'environment') return 'staging';
        if (key === 'performance.browserCache.maxAge') return 3600;
        return null;
      });
    });

    it('should set cache headers in non-development, non-production environments', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'environment') return 'staging';
        if (key === 'performance.browserCache.maxAge') return 3600;
        if (key === 'performance.browserCache.pages.maxAge') return 3600;
        if (key === 'performance.browserCache.pages.staleWhileRevalidate') return 60;
        return null;
      });

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=60'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
