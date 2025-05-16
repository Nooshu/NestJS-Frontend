/**
 * Main entry point for the NestJS application.
 * Configures the application with Nunjucks templating, static assets, and Swagger documentation.
 * This module initialises the NestJS application with necessary middleware,
 * view engine configuration, and static asset serving.
 *
 * @module Main
 * @requires @nestjs/core
 * @requires @nestjs/platform-express
 * @requires @nestjs/swagger
 * @requires path
 * @requires class-validator
 * @requires class-transformer
 * @requires helmet
 * @requires compression
 * @requires cookie-parser
 * @requires csrf-csrf
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import type { ServeStaticOptions } from '@nestjs/platform-express/interfaces/serve-static-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { performanceConfig } from './shared/config/performance.config';
import { SecurityConfig } from './shared/config/security.config';
import { SecurityErrorFilter } from './shared/filters/security-error.filter';
import { NotFoundExceptionFilter } from './shared/filters/not-found.filter';
import { ViewEngineService } from './views/view-engine.service';
import cookieParser from 'cookie-parser';

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
 *
 * @throws {Error} If the application fails to start
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

  const securityConfig = app.get(SecurityConfig);

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
    })
  );

  // Add this line to apply the global error filter
  app.useGlobalFilters(
    new SecurityErrorFilter(),
    new NotFoundExceptionFilter()
  );

  /**
   * Security Middleware Configuration
   *
   * Helmet helps secure Express apps by setting various HTTP headers.
   * It's not a silver bullet, but it can help!
   *
   * @see https://helmetjs.github.io/
   */
  app.use(helmet(securityConfig.helmet));

  /**
   * Performance Middleware Configuration
   *
   * Compression middleware compresses response bodies for all requests that traverse through the middleware.
   *
   * @see https://github.com/expressjs/compression
   */
  app.use(compression(performanceConfig.compression));

  // Add cookie-parser middleware, required for csrf token storage
  app.use(cookieParser());

  // Get the view engine service
  const viewEngineService = app.get(ViewEngineService);

  /**
   * Nunjucks View Engine Configuration
   *
   * Configures Nunjucks as the template engine with error handling.
   * The view engine service is used to render templates, and any errors
   * during rendering are logged using our Winston logger.
   *
   * @param {string} filePath - The path to the template file
   * @param {Record<string, any>} options - The options to pass to the template
   * @param {Function} callback - The callback function to call with the rendered template or error
   */
  app.engine(
    'njk',
    (
      filePath: string,
      options: Record<string, any>,
      callback: (e: any, rendered?: string) => void
    ) => {
      try {
        const html = viewEngineService.render(filePath, options);
        callback(null, html);
      } catch (error) {
        logger.error('Error rendering template', (error as Error).stack, { filePath });
        callback(error);
      }
    }
  );
  app.setViewEngine('njk');
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));

  /**
   * Static Asset Configuration
   *
   * Configures static asset serving with performance optimizations for fingerprinted assets:
   * 
   * - maxAge: 1 year (31,536,000 seconds) - Long cache duration is safe with fingerprinted assets
   *   since the URL changes when the content changes
   * 
   * - immutable: true - The immutable directive tells browsers that the asset will never
   *   change as long as the URL remains the same, which is guaranteed with fingerprinting.
   *   This prevents unnecessary revalidation requests even when users press the refresh button.
   * 
   * - etag: true - Provides a validator for conditional requests, allowing efficient 
   *   304 Not Modified responses
   * 
   * - lastModified: true - Another validator for conditional requests
   * 
   * - setHeaders: Sets 'Cache-Control: public, max-age=31536000, immutable' which instructs
   *   browsers to cache the asset for a year and never revalidate it during that time,
   *   significantly improving load times for returning visitors
   */
  const staticOptions: ServeStaticOptions = 
    process.env.NODE_ENV === 'development'
      ? {
          maxAge: 0,
          immutable: false,
          etag: false,
          lastModified: false,
          setHeaders: (res: any) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          },
        }
      : {
          maxAge: performanceConfig.staticAssets.maxAge ?? 31536000, // 1 year in milliseconds
          immutable: true, // Assets are immutable due to fingerprinting
          etag: true,
          lastModified: true,
          setHeaders: (res: any) => {
            // Set Cache-Control with immutable flag for fingerprinted assets
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          },
        };

  // Serve all static assets from dist/public
  app.useStaticAssets(join(process.cwd(), 'dist', 'public'), staticOptions);

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
  const config = new DocumentBuilder()
    .setTitle('NestJS Frontend API')
    .setDescription('API documentation for the NestJS Frontend application')
    .setVersion('1.0')
    .build();

  /**
   * Create and setup Swagger documentation
   * @param {NestExpressApplication} app - The NestJS application instance
   * @param {SwaggerDocumentOptions} swaggerConfig - Swagger configuration options
   * @param {string} 'api-docs' - The endpoint where the Swagger UI will be served
   */
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  /**
   * CORS Configuration
   *
   * Configures Cross-Origin Resource Sharing (CORS) for the application.
   * Only enabled if specified in the security configuration.
   *
   * @see https://docs.nestjs.com/security/cors
   */
  if (securityConfig.cors.enabled) {
    app.enableCors({
      origin: securityConfig.cors.origin,
      credentials: true,
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
}

/**
 * Start the application and handle any startup errors
 * @throws {Error} If the application fails to start
 */
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
