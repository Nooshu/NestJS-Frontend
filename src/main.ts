/**
 * Main entry point for the NestJS application.
 * Configures the application with Nunjucks templating, static assets, and Swagger documentation.
 * This module initializes the NestJS application with necessary middleware,
 * view engine configuration, and static asset serving.
 * 
 * @module Main
 * @requires @nestjs/core
 * @requires @nestjs/platform-express
 * @requires @nestjs/swagger
 * @requires path
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { ViewEngineService } from './views/view-engine.service';
import { securityConfig } from './shared/config/security.config';
import { performanceConfig } from './shared/config/performance.config';
import { SecurityErrorFilter } from './shared/filters/security-error.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Bootstrap function that creates and configures the NestJS application.
 * This function sets up the application with:
 * - Nunjucks view engine configuration
 * - Static asset directories
 * - GOV.UK Frontend asset serving
 * - Security features (Helmet, CORS)
 * - Performance optimizations (Compression, Caching)
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

  // Add this line to apply the global error filter
  app.useGlobalFilters(new SecurityErrorFilter());

  // Security middleware
  app.use(helmet(securityConfig.helmet));
  app.enableCors(securityConfig.cors);

  // Performance middleware
  app.use(compression(performanceConfig.compression));

  // Get the view engine service
  const viewEngineService = app.get(ViewEngineService);

  // Configure Nunjucks as the view engine
  app.engine('njk', (filePath: string, options: Record<string, any>, callback: (e: any, rendered?: string) => void) => {
    try {
      const html = viewEngineService.render(filePath, options);
      callback(null, html);
    } catch (err) {
      callback(err);
    }
  });
  app.setViewEngine('njk');
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));

  // Configure static asset directories with performance optimizations
  const staticOptions = {
    maxAge: performanceConfig.staticAssets.maxAge,
    immutable: performanceConfig.staticAssets.immutable,
    etag: performanceConfig.staticAssets.etag,
    lastModified: performanceConfig.staticAssets.lastModified,
    setHeaders: performanceConfig.staticAssets.setHeaders,
  };

  app.useStaticAssets(join(process.cwd(), 'src', 'public'), staticOptions);
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'), {
    ...staticOptions,
    prefix: '/govuk'
  });
  app.useStaticAssets(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets'), {
    ...staticOptions,
    prefix: '/assets'
  });

  /**
   * Swagger (OpenAPI) Configuration
   * Sets up API documentation with detailed information about the API endpoints.
   * 
   * The documentation will be available at: http://localhost:3000/api-docs
   * 
   * @swagger
   * - Title: Name of the API documentation
   * - Description: Detailed description of what the API provides
   * - Version: Current version of the API
   * - Additional configurations can be added here (e.g., authentication, tags, servers)
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Frontend API')
    .setDescription('API documentation for the NestJS Frontend application using GOV.UK Frontend')
    .setVersion('1.0')
    // You can add additional configuration here such as:
    // .addBearerAuth()
    // .addTag('your-tag')
    // .addServer('http://localhost:3000')
    .build();

  /**
   * Create and setup Swagger documentation
   * @param {NestExpressApplication} app - The NestJS application instance
   * @param {SwaggerDocumentOptions} swaggerConfig - Swagger configuration options
   * @param {string} 'api-docs' - The endpoint where the Swagger UI will be served
   */
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Start the application server
  // The application will be available at http://localhost:3000
  await app.listen(3000);
}

// Start the application and handle any startup errors
bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
}); 