/**
 * Main entry point for the NestJS application.
 * Configures the application with Nunjucks templating, static assets, and Swagger documentation.
 * This module initialses the NestJS application with necessary middleware,
 * view engine configuration, and static asset serving.
 * 
 * @module Main
 * @requires @nestjs/core
 * @requires @nestjs/platform-express
 * @requires @nestjs/swagger
 * @requires path
 * @requires class-validator
 * @requires class-transformer
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
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

/**
 * Bootstrap function that creates and configures the NestJS application.
 * This function sets up the application with:
 * - Nunjucks view engine configuration
 * - Static asset directories
 * - GOV.UK Frontend asset serving
 * - Security features (Helmet, CORS)
 * - Performance optimizations (Compression, Caching)
 * - Request validation using class-validator and class-transformer
 * - Winston-based logging system
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
  // Enable buffered logs to ensure all startup logs are captured
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  /**
   * Logger Initialization
   * 
   * The LoggerService is marked as a transient-scoped provider, which means a new instance
   * is created for each injection. In the bootstrap phase, we need to use app.resolve()
   * instead of app.get() to properly instantiate the logger.
   * 
   * @see https://docs.nestjs.com/fundamentals/injection-scopes
   */
  const logger = await app.resolve(LoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  /**
   * Global Validation Pipe Configuration
   * 
   * The ValidationPipe is a built-in NestJS pipe that uses class-validator and class-transformer
   * to validate and transform incoming request data. It provides automatic validation
   * of all incoming client payloads against DTO classes.
   * 
   * Configuration options:
   * - transform: true - Automatically transform payloads to DTO instances
   * - whitelist: true - Strip properties that don't have any decorators
   * - forbidNonWhitelisted: true - Throw an error if non-whitelisted properties are present
   * - transformOptions.enableImplicitConversion: true - Automatically convert primitive types
   * 
   * @see https://docs.nestjs.com/techniques/validation
   * @see https://github.com/typestack/class-validator
   * @see https://github.com/typestack/class-transformer
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Add this line to apply the global error filter
  app.useGlobalFilters(new SecurityErrorFilter());

  // Security middleware
  app.use(helmet(securityConfig.helmet));
  app.enableCors(securityConfig.cors);

  // Performance middleware
  app.use(compression(performanceConfig.compression));

  // Get the view engine service
  const viewEngineService = app.get(ViewEngineService);

  /**
   * Nunjucks View Engine Configuration
   * 
   * Configures Nunjucks as the template engine with error handling.
   * The view engine service is used to render templates, and any errors
   * during rendering are logged using our Winston logger.
   */
  app.engine('njk', (filePath: string, options: Record<string, any>, callback: (e: any, rendered?: string) => void) => {
    try {
      const html = viewEngineService.render(filePath, options);
      callback(null, html);
    } catch (error) {
      logger.error('Error rendering template', error.stack, { filePath });
      callback(error);
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
}

// Start the application and handle any startup errors
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
}); 