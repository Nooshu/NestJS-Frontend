/**
 * Root module of the NestJS application.
 * Configures the application's dependencies and providers.
 * This module serves as the entry point for the application's dependency injection system
 * and defines the application's structure and available components.
 * 
 * @module AppModule
 * @requires @nestjs/common
 * @requires @nestjs/core
 * @requires @nestjs/platform-express
 */

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { ViewsModule } from './views/views.module';
import { SecurityModule } from './shared/security/security.module';
import { ErrorMiddleware } from './shared/middleware/error.middleware';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { ViewsController } from './views/views.controller';
import { AppCacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { CsrfMiddleware } from './shared/middleware/csrf.middleware';
import { CspReportController } from './shared/controllers/csp-report.controller';

/**
 * Root module class that bootstraps the application.
 * This class is decorated with @Module to define the application's structure:
 * - imports: Other modules that this module depends on
 * - controllers: Controllers that handle HTTP requests
 * - providers: Services and other injectable classes
 * 
 * @class AppModule
 * @description The root module of the application that ties everything together
 * 
 * @example
 * // Usage in main.ts
 * const app = await NestFactory.create(AppModule);
 * 
 * @property {Module} imports - Array of modules that this module depends on
 * @property {Module} controllers - Array of controllers that handle HTTP requests
 * @property {Module} providers - Array of services and other injectable classes
 */
@Module({
  imports: [
    CoreModule.forRoot(),
    ViewsModule.forRoot(),
    SecurityModule,
    AppCacheModule,
    LoggerModule,
  ],
  controllers: [AppController, ViewsController, CspReportController],
  providers: [],
})
export class AppModule {
  /**
   * Configure middleware for the application.
   * This method is called by NestJS during the application bootstrap phase.
   * It configures the order and scope of middleware application.
   * 
   * @method configure
   * @param {MiddlewareConsumer} consumer - The middleware consumer
   * 
   * @example
   * // The middleware is applied in the following order:
   * // 1. Error handling middleware (all routes)
   * // 2. Logging middleware (all routes)
   * // 3. CSRF protection (all routes except API and health check)
   */
  configure(consumer: MiddlewareConsumer) {
    /**
     * Error Handling Middleware
     * Applied to all routes to catch and handle errors consistently
     */
    consumer
      .apply(ErrorMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });

    /**
     * Logging Middleware
     * Applied to all routes to log request/response information
     */
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });

    /**
     * CSRF Protection Middleware
     * Applied to all routes except API routes and health check
     * to protect against Cross-Site Request Forgery attacks
     */
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'api', method: RequestMethod.ALL },
        { path: 'api/*path', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL }
      )
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
} 