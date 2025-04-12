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
import { AppModule } from './app.module';
import { createNunjucksEngine } from './nunjucks.engine';

/**
 * Bootstrap function that creates and configures the NestJS application.
 * This function sets up the application with:
 * - Nunjucks view engine configuration
 * - Static asset directories
 * - GOV.UK Frontend asset serving
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
  
  // Configure Nunjucks as the view engine
  // - Register the Nunjucks engine with the '.njk' extension
  // - Set Nunjucks as the default view engine
  app.engine('njk', createNunjucksEngine());
  app.setViewEngine('njk');
  
  // Set the base directory for template files
  // This is where Nunjucks will look for template files
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));
  
  // Configure static asset directories
  // - Serve application public assets
  // - Serve GOV.UK Frontend assets with specific prefixes
  app.useStaticAssets(join(process.cwd(), 'src', 'public'));
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'govuk', 'assets'), {
    prefix: '/assets'  // Serve GOV.UK assets under /assets path
  });
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'govuk'), {
    prefix: '/govuk'   // Serve GOV.UK components under /govuk path
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