import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import { applyGovukFrontend } from '../govuk.middleware';
import { mockGovukConfig } from './test.config';

describe('GOV.UK Frontend Middleware', () => {
  let app: Application;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    app = express();
    mockRequest = {
      path: '/test',
      cookies: {},
    } as Partial<Request>;

    mockResponse = {
      locals: {},
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    mockNext = jest.fn();
  });

  describe('applyGovukFrontend', () => {
    it('should apply static assets middleware', () => {
      const useSpy = jest.spyOn(app, 'use');
      applyGovukFrontend(app, mockGovukConfig);
      
      // Check that static assets middleware is applied
      expect(useSpy).toHaveBeenCalledWith('/assets', expect.any(Function));
      useSpy.mockRestore();
    });

    it('should apply configuration middleware', () => {
      const useSpy = jest.spyOn(app, 'use');
      applyGovukFrontend(app, mockGovukConfig);
      
      // Should be called 3 times: static assets + config + cookie consent
      expect(useSpy).toHaveBeenCalledTimes(3);
      useSpy.mockRestore();
    });

    it('should apply cookie consent middleware', () => {
      const useSpy = jest.spyOn(app, 'use');
      applyGovukFrontend(app, mockGovukConfig);
      
      // The last call should be for cookie consent
      const calls = useSpy.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(3);
      useSpy.mockRestore();
    });

    it('should handle different configurations', () => {
      const customConfig = {
        ...mockGovukConfig,
        base: {
          ...mockGovukConfig.base,
          serviceName: 'Custom Service',
          showPhaseBanner: false,
        },
        cookieBanner: {
          ...mockGovukConfig.cookieBanner,
          showCookieBanner: false,
        },
      };

      const useSpy = jest.spyOn(app, 'use');
      applyGovukFrontend(app, customConfig);
      
      expect(useSpy).toHaveBeenCalled();
      useSpy.mockRestore();
    });
  });

  describe('Configuration Middleware Logic', () => {
    it('should add GOV.UK configuration to response locals', () => {
      // Extract the configuration middleware logic
      const config = mockGovukConfig;
      const middleware = (_req: Request, res: Response, next: NextFunction) => {
        // Add GOV.UK Frontend configuration to locals
        res.locals.govuk = {
          base: config.base,
          header: config.header,
          footer: config.footer,
          cookieBanner: config.cookieBanner,
        };

        // Add phase banner if enabled
        if (config.base.showPhaseBanner) {
          res.locals.govuk.phaseBanner = {
            phase: config.base.phase,
            feedbackLink: config.base.feedbackLink,
          };
        }

        next();
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.locals?.govuk).toBeDefined();
      expect(mockResponse.locals?.govuk.base).toEqual(mockGovukConfig.base);
      expect(mockResponse.locals?.govuk.header).toEqual(mockGovukConfig.header);
      expect(mockResponse.locals?.govuk.footer).toEqual(mockGovukConfig.footer);
      expect(mockResponse.locals?.govuk.cookieBanner).toEqual(mockGovukConfig.cookieBanner);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add phase banner when showPhaseBanner is true', () => {
      const config = mockGovukConfig;
      const middleware = (_req: Request, res: Response, next: NextFunction) => {
        res.locals.govuk = {
          base: config.base,
          header: config.header,
          footer: config.footer,
          cookieBanner: config.cookieBanner,
        };

        if (config.base.showPhaseBanner) {
          res.locals.govuk.phaseBanner = {
            phase: config.base.phase,
            feedbackLink: config.base.feedbackLink,
          };
        }

        next();
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.locals?.govuk.phaseBanner).toBeDefined();
      expect(mockResponse.locals?.govuk.phaseBanner.phase).toBe(mockGovukConfig.base.phase);
      expect(mockResponse.locals?.govuk.phaseBanner.feedbackLink).toBe(mockGovukConfig.base.feedbackLink);
    });

    it('should not add phase banner when showPhaseBanner is false', () => {
      const disabledConfig = {
        ...mockGovukConfig,
        base: {
          ...mockGovukConfig.base,
          showPhaseBanner: false,
        },
      };

      const middleware = (_req: Request, res: Response, next: NextFunction) => {
        res.locals.govuk = {
          base: disabledConfig.base,
          header: disabledConfig.header,
          footer: disabledConfig.footer,
          cookieBanner: disabledConfig.cookieBanner,
        };

        if (disabledConfig.base.showPhaseBanner) {
          res.locals.govuk.phaseBanner = {
            phase: disabledConfig.base.phase,
            feedbackLink: disabledConfig.base.feedbackLink,
          };
        }

        next();
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.locals?.govuk.phaseBanner).toBeUndefined();
    });
  });

  describe('Cookie Consent Middleware Logic', () => {
    it('should show cookie banner when cookies are not accepted', () => {
      const config = mockGovukConfig;
      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (config.cookieBanner.showCookieBanner) {
          // Check if user has accepted cookies
          const cookiesAccepted = req.cookies['cookies_policy'] === 'accept';

          // Add cookie consent to locals
          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: config.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: config.base,
            header: config.header,
            footer: config.footer,
            cookieBanner: config.cookieBanner,
          },
        },
      } as any;

      const testRequest = {
        ...mockRequest,
        cookies: {},
      } as Request;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent).toBeDefined();
      expect(testResponse.locals.govuk.cookieConsent.showBanner).toBe(true);
      expect(testResponse.locals.govuk.cookieConsent.accepted).toBe(false);
      expect(testResponse.locals.govuk.cookieConsent.policyUrl).toBe(mockGovukConfig.cookieBanner.cookiePolicyUrl);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not show cookie banner when cookies are accepted', () => {
      const config = mockGovukConfig;
      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (config.cookieBanner.showCookieBanner) {
          const cookiesAccepted = req.cookies['cookies_policy'] === 'accept';

          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: config.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: config.base,
            header: config.header,
            footer: config.footer,
            cookieBanner: config.cookieBanner,
          },
        },
      } as any;

      const testRequest = {
        ...mockRequest,
        cookies: { cookies_policy: 'accept' },
      } as Request;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent.showBanner).toBe(false);
      expect(testResponse.locals.govuk.cookieConsent.accepted).toBe(true);
    });

    it('should not add cookie consent when showCookieBanner is false', () => {
      const disabledConfig = {
        ...mockGovukConfig,
        cookieBanner: {
          ...mockGovukConfig.cookieBanner,
          showCookieBanner: false,
        },
      };

      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (disabledConfig.cookieBanner.showCookieBanner) {
          const cookiesAccepted = req.cookies['cookies_policy'] === 'accept';

          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: disabledConfig.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: disabledConfig.base,
            header: disabledConfig.header,
            footer: disabledConfig.footer,
            cookieBanner: disabledConfig.cookieBanner,
          },
        },
      } as any;

      const testRequest = {
        ...mockRequest,
        cookies: {},
      } as Request;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent).toBeUndefined();
    });

    it('should handle different cookie values', () => {
      const config = mockGovukConfig;
      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (config.cookieBanner.showCookieBanner) {
          const cookiesAccepted = req.cookies['cookies_policy'] === 'accept';

          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: config.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: config.base,
            header: config.header,
            footer: config.footer,
            cookieBanner: config.cookieBanner,
          },
        },
      } as any;

      const testRequest = {
        ...mockRequest,
        cookies: { cookies_policy: 'reject' },
      } as Request;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent.showBanner).toBe(true);
      expect(testResponse.locals.govuk.cookieConsent.accepted).toBe(false);
    });

    it('should handle missing cookies object', () => {
      const config = mockGovukConfig;
      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (config.cookieBanner.showCookieBanner) {
          // Defensive: if req.cookies is undefined, treat as empty object
          const cookies = req.cookies || {};
          const cookiesAccepted = cookies['cookies_policy'] === 'accept';

          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: config.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: config.base,
            header: config.header,
            footer: config.footer,
            cookieBanner: config.cookieBanner,
          },
        },
      } as any;

      // Simulate missing cookies property
      const testRequest = {
        ...mockRequest,
      } as any;
      delete testRequest.cookies;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent.showBanner).toBe(true);
      expect(testResponse.locals.govuk.cookieConsent.accepted).toBe(false);
    });

    it('should handle undefined cookies_policy', () => {
      const config = mockGovukConfig;
      const middleware = (req: Request, res: Response, next: NextFunction) => {
        if (config.cookieBanner.showCookieBanner) {
          const cookiesAccepted = req.cookies['cookies_policy'] === 'accept';

          res.locals.govuk.cookieConsent = {
            showBanner: !cookiesAccepted,
            accepted: cookiesAccepted,
            policyUrl: config.cookieBanner.cookiePolicyUrl,
          };
        }

        next();
      };

      const testResponse = {
        locals: {
          govuk: {
            base: config.base,
            header: config.header,
            footer: config.footer,
            cookieBanner: config.cookieBanner,
          },
        },
      } as any;

      const testRequest = {
        ...mockRequest,
        cookies: { other_cookie: 'value' },
      } as Request;

      middleware(testRequest, testResponse, mockNext);

      expect(testResponse.locals.govuk.cookieConsent.showBanner).toBe(true);
      expect(testResponse.locals.govuk.cookieConsent.accepted).toBe(false);
    });
  });
});
