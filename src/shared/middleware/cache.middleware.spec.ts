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
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
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
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      it('should set cache headers with custom duration from config', () => {
        (configService.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'environment') return 'production';
          if (key === 'performance.browserCache.maxAge') return 7200;
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=7200');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
        expect(nextFunction).toHaveBeenCalled();
      });

      it('should set cache headers with default duration when config is not set', () => {
        (configService.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'environment') return 'production';
          if (key === 'performance.browserCache.maxAge') return null;
          return null;
        });

        middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
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
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Encoding');
      expect(nextFunction).toHaveBeenCalled();
    });
  });
}); 