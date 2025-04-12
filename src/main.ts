/**
 * Main entry point for the NestJS application.
 * Configures the application with Nunjucks templating and static assets.
 * 
 * @module Main
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { createNunjucksEngine } from './nunjucks.engine';

/**
 * Bootstrap function that creates and configures the NestJS application.
 * 
 * @async
 * @function bootstrap
 * @returns {Promise<void>} A promise that resolves when the application is ready
 */
async function bootstrap() {
  // Create the NestJS application with Express platform
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure Nunjucks as the view engine
  app.engine('njk', createNunjucksEngine());
  app.setViewEngine('njk');
  
  // Set the base views directory
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));
  
  // Configure static assets directories
  app.useStaticAssets(join(process.cwd(), 'src', 'public'));
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'govuk', 'assets'), {
    prefix: '/assets'
  });
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'govuk'), {
    prefix: '/govuk'
  });
  
  // Start the application on port 3000
  await app.listen(3000);
}

// Start the application
bootstrap(); 