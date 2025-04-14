/**
 * Root module of the NestJS application.
 * Configures the application's dependencies and providers.
 * This module serves as the entry point for the application's dependency injection system
 * and defines the application's structure and available components.
 * 
 * @module AppModule
 * @requires @nestjs/common
 */

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { ViewsModule } from './views/views.module';
import { SecurityModule } from './shared/security/security.module';
import { ErrorMiddleware } from './shared/middleware/error.middleware';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { ViewsController } from './views/views.controller';

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
 */
@Module({
  imports: [
    CoreModule.forRoot(),
    ViewsModule.forRoot(),
    SecurityModule,
  ],
  controllers: [AppController, ViewsController],
  providers: [],
})
export class AppModule {
  /**
   * Configure middleware for the application.
   * 
   * @method configure
   * @param {MiddlewareConsumer} consumer - The middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    // Apply error handling middleware to all routes
    consumer
      .apply(ErrorMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply logging middleware to all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 