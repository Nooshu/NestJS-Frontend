/**
 * Core module that provides application-wide configuration and services.
 * This module should be imported only once in the root module.
 * It handles core functionality such as configuration management and shared services.
 *
 * @module CoreModule
 * @requires @nestjs/common
 * @requires @nestjs/config
 * @requires ../shared/shared.module
 *
 * @example
 * // Import in AppModule
 * @Module({
 *   imports: [CoreModule.forRoot()],
 * })
 * export class AppModule {}
 */

import { Module, type DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../shared/shared.module';

/**
 * Core module that provides application-wide configuration.
 * This module uses the forRoot() pattern to ensure it's only imported once
 * and provides global configuration through ConfigModule.
 *
 * @class CoreModule
 * @description Provides core application configuration and services
 *
 * @property {ConfigModule} ConfigModule - Provides configuration management
 * @property {SharedModule} SharedModule - Provides shared services and utilities
 */
@Module({})
export class CoreModule {
  /**
   * Creates a configured core module.
   * This method configures the module with environment-specific settings
   * and exports configuration and shared services.
   *
   * @static
   * @method forRoot
   * @returns {DynamicModule} The configured core module
   *
   * @example
   * // Usage in AppModule
   * imports: [CoreModule.forRoot()]
   *
   * @description
   * The method:
   * 1. Sets up ConfigModule with environment file support
   * 2. Makes configuration globally available
   * 3. Imports and exports SharedModule
   */
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env', '.env.development', '.env.production'],
        }),
        SharedModule,
      ],
      exports: [ConfigModule, SharedModule],
    };
  }
}
