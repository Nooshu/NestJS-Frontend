import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import { type GovukConfig } from './govuk.config';

/**
 * Applies GOV.UK Frontend configuration to the Express application
 */
export function applyGovukFrontend(app: Application, config: GovukConfig): void {
  // Add GOV.UK Frontend assets
  app.use('/assets', express.static('node_modules/govuk-frontend/dist/govuk/assets'));

  // Add GOV.UK Frontend configuration to all responses
  app.use((_req: Request, res: Response, next: NextFunction) => {
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
  });

  // Add cookie consent middleware
  app.use(cookieConsent(config));
}

/**
 * Cookie consent middleware
 */
function cookieConsent(config: GovukConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
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
}
