import express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import nunjucks from 'nunjucks';
import { securityConfig } from '../../shared/config/security.config';
import { performanceConfig } from '../../shared/config/performance.config';
import { setupRoutes } from './routes';
import { setupErrorHandling } from './error-handling';
import { setupGovUKFrontend } from './govuk';
import { setupLogger } from './logger';

/**
 * Creates and configures an Express.js application with GOV.UK Frontend support.
 * This adapter provides a compatibility layer for government departments using Express.js.
 * 
 * @param {Object} config - Configuration object for the Express.js application
 * @returns {express.Application} Configured Express.js application
 */
export function createExpressApp(config = {}) {
  const app = express();

  // Basic Express.js configuration
  app.set('view engine', 'njk');
  app.set('views', join(process.cwd(), 'src', 'views'));

  // Setup Nunjucks
  const nunjucksEnv = nunjucks.configure(join(process.cwd(), 'src', 'views'), {
    autoescape: true,
    watch: process.env.NODE_ENV !== 'production',
    noCache: process.env.NODE_ENV !== 'production',
  });

  // Setup middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Security middleware
  app.use(helmet(securityConfig.helmet));
  
  // Performance middleware
  app.use(compression(performanceConfig.compression));

  // Setup static assets
  const staticOptions = {
    maxAge: performanceConfig.staticAssets.maxAge,
    immutable: performanceConfig.staticAssets.immutable,
    etag: performanceConfig.staticAssets.etag,
    lastModified: performanceConfig.staticAssets.lastModified,
    setHeaders: performanceConfig.staticAssets.setHeaders,
  };

  app.use('/public', express.static(join(process.cwd(), 'src', 'public'), staticOptions));
  app.use('/govuk', express.static(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'), staticOptions));
  app.use('/assets', express.static(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets'), staticOptions));

  // Setup logging
  setupLogger(app);

  // Setup GOV.UK Frontend
  setupGovUKFrontend(app, nunjucksEnv);

  // Setup routes
  setupRoutes(app);

  // Setup error handling
  setupErrorHandling(app);

  return app;
} 