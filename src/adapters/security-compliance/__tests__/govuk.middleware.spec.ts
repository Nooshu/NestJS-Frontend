import express, { type Application, type Request, type Response } from 'express';
import { applyGovukFrontend } from '../govuk.middleware';
import { mockGovukConfig } from './test.config';

describe('GOV.UK Frontend Middleware', () => {
  let app: Application;
  let requestHandlers: Array<(req: Request, res: Response, next: any) => void>;

  const captureHandlers = (config = mockGovukConfig) => {
    app = express();
    requestHandlers = [];
    jest.spyOn(app, 'use').mockImplementation((...args: any[]) => {
      // Only capture unmounted request middleware (config + cookie consent)
      if (typeof args[0] === 'function' && args[0].length >= 2) {
        requestHandlers.push(args[0]);
      }
      return app;
    });
    applyGovukFrontend(app, config);
  };

  beforeEach(() => {
    captureHandlers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register static assets, config, and cookie consent middleware', () => {
    expect(app.use).toHaveBeenCalledWith('/assets', expect.any(Function));
    expect(requestHandlers).toHaveLength(2);
  });

  describe('configuration middleware', () => {
    it('should add GOV.UK config and phase banner to locals', () => {
      const configMiddleware = requestHandlers[0];
      const res = { locals: {} } as Response;
      const next = jest.fn();

      configMiddleware({} as Request, res, next);

      expect(res.locals.govuk).toMatchObject({
        base: mockGovukConfig.base,
        header: mockGovukConfig.header,
        footer: mockGovukConfig.footer,
        cookieBanner: mockGovukConfig.cookieBanner,
        phaseBanner: {
          phase: mockGovukConfig.base.phase,
          feedbackLink: mockGovukConfig.base.feedbackLink,
        },
      });
      expect(next).toHaveBeenCalled();
    });

    it('should omit phase banner when disabled', () => {
      captureHandlers({
        ...mockGovukConfig,
        base: { ...mockGovukConfig.base, showPhaseBanner: false },
      });

      const configMiddleware = requestHandlers[0];
      const res = { locals: {} } as Response;
      const next = jest.fn();

      configMiddleware({} as Request, res, next);

      expect(res.locals.govuk.phaseBanner).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('cookie consent middleware', () => {
    it('should show banner when cookies are not accepted', () => {
      const cookieMiddleware = requestHandlers[1];
      const req = { cookies: {} } as Request;
      const res = { locals: { govuk: {} } } as Response;
      const next = jest.fn();

      cookieMiddleware(req, res, next);

      expect(res.locals.govuk.cookieConsent).toEqual({
        showBanner: true,
        accepted: false,
        policyUrl: mockGovukConfig.cookieBanner.cookiePolicyUrl,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should hide banner when cookies are accepted', () => {
      const cookieMiddleware = requestHandlers[1];
      const req = { cookies: { cookies_policy: 'accept' } } as unknown as Request;
      const res = { locals: { govuk: {} } } as Response;
      const next = jest.fn();

      cookieMiddleware(req, res, next);

      expect(res.locals.govuk.cookieConsent).toEqual({
        showBanner: false,
        accepted: true,
        policyUrl: mockGovukConfig.cookieBanner.cookiePolicyUrl,
      });
    });

    it('should skip cookie consent locals when banner is disabled', () => {
      captureHandlers({
        ...mockGovukConfig,
        cookieBanner: { ...mockGovukConfig.cookieBanner, showCookieBanner: false },
      });

      const cookieMiddleware = requestHandlers[1];
      const res = { locals: { govuk: {} } } as Response;
      const next = jest.fn();

      cookieMiddleware({ cookies: {} } as Request, res, next);

      expect(res.locals.govuk.cookieConsent).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
