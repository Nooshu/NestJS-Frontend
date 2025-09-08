import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import { SecurityConfig } from '../../config/security.config';
import { CspMiddleware } from './csp.middleware';

describe('CspMiddleware', () => {
  let middleware: CspMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response> & { setHeader: jest.Mock };
  let nextFunction: jest.Mock;
  let mockSecurityConfig: Partial<SecurityConfig>;

  beforeEach(async () => {
    mockSecurityConfig = {
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

    const moduleRef = await Test.createTestingModule({
      providers: [
        CspMiddleware,
        {
          provide: SecurityConfig,
          useValue: mockSecurityConfig,
        },
      ],
    }).compile();

    middleware = moduleRef.get<CspMiddleware>(CspMiddleware);

    mockRequest = {
      method: 'GET',
      path: '/test',
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe('use', () => {
    it('should call next() immediately when CSP is disabled', () => {
      // Mock CSP as disabled
      mockSecurityConfig.csp!.enabled = false;

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should set CSP header when CSP is enabled', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("defaultSrc 'self'")
      );
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should format CSP header correctly with all directives', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self'",
        "scriptSrc 'self' 'unsafe-inline'",
        "styleSrc 'self' 'unsafe-inline'",
        "imgSrc 'self' data: https:",
        "connectSrc 'self'",
        "fontSrc 'self'",
        "objectSrc 'none'",
        "mediaSrc 'self'",
        "frameSrc 'none'",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });

    it('should handle custom CSP directives', () => {
      // Mock custom directives
      mockSecurityConfig.csp!.directives = {
        defaultSrc: ["'self'", 'https://example.com'],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self' https://example.com",
        "scriptSrc 'self' 'unsafe-eval'",
        "styleSrc 'self'",
        "imgSrc 'self' data: blob:",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });

    it('should handle empty directives', () => {
      // Mock empty directives
      mockSecurityConfig.csp!.directives = {};

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        ''
      );
    });

    it('should handle directives with single values', () => {
      // Mock directives with single values
      mockSecurityConfig.csp!.directives = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'unsafe-inline'"],
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self'",
        "scriptSrc 'none'",
        "styleSrc 'unsafe-inline'",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });

    it('should handle directives with mixed value types', () => {
      // Mock directives with mixed types (some arrays, some strings)
      mockSecurityConfig.csp!.directives = {
        defaultSrc: ["'self'"],
        scriptSrc: "'unsafe-inline'", // String instead of array
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        imgSrc: "'self'", // String instead of array
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self'",
        "scriptSrc 'unsafe-inline'",
        "styleSrc 'self' https://fonts.googleapis.com",
        "imgSrc 'self'",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });

    it('should use default directives when config is undefined', () => {
      // Mock undefined directives to test fallback
      mockSecurityConfig.csp!.directives = undefined as any;

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      // Should call next() without setting headers when directives is undefined
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should handle special CSP directive values', () => {
      // Mock directives with special values like 'none', 'unsafe-inline', etc.
      mockSecurityConfig.csp!.directives = {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const cspHeader = (mockResponse.setHeader as jest.Mock).mock.calls[0][1];
      
      expect(cspHeader).toContain("defaultSrc 'none'");
      expect(cspHeader).toContain("scriptSrc 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(cspHeader).toContain("styleSrc 'self' 'unsafe-inline'");
      expect(cspHeader).toContain("imgSrc 'self' data: blob: https:");
      expect(cspHeader).toContain("connectSrc 'self' wss: https:");
      expect(cspHeader).toContain("fontSrc 'self' https://fonts.gstatic.com");
      expect(cspHeader).toContain("objectSrc 'none'");
      expect(cspHeader).toContain("mediaSrc 'self'");
      expect(cspHeader).toContain("frameSrc 'none'");
      expect(cspHeader).toContain("baseUri 'self'");
      expect(cspHeader).toContain("formAction 'self'");
      expect(cspHeader).toContain("frameAncestors 'none'");
      expect(cspHeader).toContain("upgradeInsecureRequests");
    });
  });

  describe('constructor', () => {
    it('should be instantiable with SecurityConfig', () => {
      expect(middleware).toBeDefined();
      expect(middleware).toBeInstanceOf(CspMiddleware);
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined directive values gracefully', () => {
      // Mock directives with null/undefined values
      mockSecurityConfig.csp!.directives = {
        defaultSrc: ["'self'"],
        scriptSrc: null as any, // null value
        styleSrc: undefined as any, // undefined value
        imgSrc: ["'self'"],
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self'",
        "scriptSrc 'none'",
        "styleSrc 'none'",
        "imgSrc 'self'",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });

    it('should handle non-array directive values', () => {
      // Mock directives with non-array values
      mockSecurityConfig.csp!.directives = {
        defaultSrc: "'self'", // String instead of array
        scriptSrc: 123 as any, // Number instead of array
        styleSrc: true as any, // Boolean instead of array
        imgSrc: ["'self'"],
      };

      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      const expectedCspHeader = [
        "defaultSrc 'self'",
        "scriptSrc 123",
        "styleSrc true",
        "imgSrc 'self'",
      ].join('; ');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCspHeader
      );
    });
  });
});
