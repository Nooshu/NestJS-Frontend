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

import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppCacheModule } from './cache/cache.module';
import { CoreModule } from './core/core.module';
import { LoggerModule } from './logger/logger.module';
import { CspReportController } from './shared/controllers/csp-report.controller';
import { CacheMiddleware } from './shared/middleware/cache.middleware';
import { CacheOverrideMiddleware } from './shared/middleware/cache-override.middleware';
import { CompressionMiddleware } from './shared/middleware/compression.middleware';
import { CsrfMiddleware } from './shared/middleware/csrf.middleware';
import { ErrorMiddleware } from './shared/middleware/error.middleware';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { SecurityModule } from './shared/security/security.module';
import { ViewsController } from './views/views.controller';
import { ViewsModule } from './views/views.module';
import { NewJourneyModule } from './views/journeys/new-journey/new-journey.module';
import { FindCourtTribunalModule } from './views/journeys/find-a-court-or-tribunal/find-a-court-or-tribunal.module';
import { HealthModule } from './shared/health/health.module';

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
    HealthModule,
    NewJourneyModule,
    FindCourtTribunalModule,
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
   * // 3. Compression middleware (all routes)
   * // 4. Cache middleware (all GET routes)
   * // 5. CSRF protection (all routes except API and health check)
   */
  configure(consumer: MiddlewareConsumer) {
    /**
     * Error Handling Middleware
     * Applied to all routes to catch and handle errors consistently
     */
    consumer.apply(ErrorMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });

    /**
     * Logging Middleware
     * Applied to all routes to log request/response information
     */
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });

    /**
     * Compression Middleware
     * Applied to all routes to compress response bodies
     */
    consumer.apply(CompressionMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });

    /**
     * Cache Middleware
     * Applied to all GET routes to enable response caching
     */
    consumer.apply(CacheMiddleware).forRoutes({ path: '*path', method: RequestMethod.GET });

    /**
     * Cache Override Middleware
     * Applied AFTER cache middleware to ensure static assets get proper cache headers
     * This middleware specifically targets static assets and overrides any existing cache headers
     */
    consumer.apply(CacheOverrideMiddleware).forRoutes({ path: '*path', method: RequestMethod.GET });

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
