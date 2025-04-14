/**
 * Main entry point for the NestJS application.
 * Configures the application with Nunjucks templating and static assets.
 * This module initializes the NestJS application with necessary middleware,
 * view engine configuration, and static asset serving.
 * 
 * @module Main
 * @requires @nestjs/core
 * @requires @nestjs/platform-express
 * @requires path
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ViewEngineService } from './views/view-engine.service';
import { securityConfig } from './shared/config/security.config';

/**
 * Bootstrap function that creates and configures the NestJS application.
 * This function sets up the application with:
 * - Nunjucks view engine configuration
 * - Static asset directories
 * - GOV.UK Frontend asset serving
 * - Security features (Helmet, CORS)
 * 
 * @async
 * @function bootstrap
 * @returns {Promise<void>} A promise that resolves when the application is ready
 * 
 * @example
 * // Start the application
 * bootstrap().catch(err => {
 *   console.error('Failed to start application:', err);
 *   process.exit(1);
 * });
 */
async function bootstrap() {
  // Create the NestJS application instance with Express platform
  // This provides access to Express-specific features like view engine configuration
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware
  app.use(helmet(securityConfig.helmet));
  app.enableCors(securityConfig.cors);

  // Get the view engine service
  const viewEngineService = app.get(ViewEngineService);

  // Configure Nunjucks as the view engine
  app.engine('njk', (filePath: string, options: Record<string, unknown>, callback: (err: Error | null, html?: string) => void) => {
    try {
      const html = viewEngineService.render(filePath, options);
      callback(null, html);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  });
  app.setViewEngine('njk');
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));

  // Configure static asset directories
  // - Serve application public assets
  // - Serve GOV.UK Frontend assets directly from node_modules
  app.useStaticAssets(join(process.cwd(), 'src', 'public'));
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'), {
    prefix: '/govuk'  // Serve GOV.UK assets under /govuk path
  });
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets'), {
    prefix: '/assets'  // Serve GOV.UK assets under /assets path
  });

  // Start the application server
  // The application will be available at http://localhost:3000
  await app.listen(3000);
}

// Start the application and handle any startup errors
bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
}); 