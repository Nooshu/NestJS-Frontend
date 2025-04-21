import express from 'express';
import request, { Response } from 'supertest';
import { applyGovukFrontend } from '../govuk.middleware';
import { mockGovukConfig } from './test.config';

// Extend Express Response type
declare global {
  namespace Express {
    interface Response {
      locals: {
        govuk?: {
          base: typeof mockGovukConfig.base;
          header: typeof mockGovukConfig.header;
          footer: typeof mockGovukConfig.footer;
          phaseBanner?: {
            phase: string;
            feedbackLink: string;
          };
          cookieConsent?: {
            showBanner: boolean;
            accepted: boolean;
          };
        };
      };
    }
  }
}

// Add type assertion helper
const asResponse = (res: any): Response & { locals: any } => res;

describe('GOV.UK Frontend Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    applyGovukFrontend(app, mockGovukConfig);
    
    // Add a test route
    app.get('/test', (req, res) => {
      res.render('test', { title: 'Test Page' });
    });
  });

  describe('Configuration', () => {
    it('should add GOV.UK configuration to response locals', async () => {
      const response = asResponse(await request(app).get('/test'));
      
      expect(response.locals.govuk).toBeDefined();
      expect(response.locals.govuk.base).toEqual(mockGovukConfig.base);
      expect(response.locals.govuk.header).toEqual(mockGovukConfig.header);
      expect(response.locals.govuk.footer).toEqual(mockGovukConfig.footer);
    });
  });

  describe('Phase Banner', () => {
    it('should add phase banner when enabled', async () => {
      const response = asResponse(await request(app).get('/test'));
      
      expect(response.locals.govuk.phaseBanner).toBeDefined();
      expect(response.locals.govuk.phaseBanner.phase).toBe(mockGovukConfig.base.phase);
      expect(response.locals.govuk.phaseBanner.feedbackLink).toBe(mockGovukConfig.base.feedbackLink);
    });

    it('should not add phase banner when disabled', async () => {
      const disabledConfig = {
        ...mockGovukConfig,
        base: {
          ...mockGovukConfig.base,
          showPhaseBanner: false,
        },
      };
      
      app = express();
      applyGovukFrontend(app, disabledConfig);
      
      const response = asResponse(await request(app).get('/test'));
      expect(response.locals.govuk.phaseBanner).toBeUndefined();
    });
  });

  describe('Cookie Banner', () => {
    it('should show cookie banner when cookies not accepted', async () => {
      const response = asResponse(await request(app).get('/test'));
      
      expect(response.locals.govuk.cookieConsent).toBeDefined();
      expect(response.locals.govuk.cookieConsent.showBanner).toBe(true);
      expect(response.locals.govuk.cookieConsent.accepted).toBe(false);
    });

    it('should not show cookie banner when cookies accepted', async () => {
      const response = asResponse(await request(app)
        .get('/test')
        .set('Cookie', 'cookies_policy=accept'));
      
      expect(response.locals.govuk.cookieConsent.showBanner).toBe(false);
      expect(response.locals.govuk.cookieConsent.accepted).toBe(true);
    });

    it('should not add cookie consent when disabled', async () => {
      const disabledConfig = {
        ...mockGovukConfig,
        cookieBanner: {
          ...mockGovukConfig.cookieBanner,
          showCookieBanner: false,
        },
      };
      
      app = express();
      applyGovukFrontend(app, disabledConfig);
      
      const response = asResponse(await request(app).get('/test'));
      expect(response.locals.govuk.cookieConsent).toBeUndefined();
    });
  });
}); 