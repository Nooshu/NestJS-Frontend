/**
 * Core module that provides application-wide configuration and services.
 * This module should be imported only once in the root module.
 * 
 * @module CoreModule
 * @requires @nestjs/common
 */

import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../shared/shared.module';

/**
 * Core module that provides application-wide configuration.
 * 
 * @class CoreModule
 * @description Provides core application configuration and services
 */
@Module({})
export class CoreModule {
  /**
   * Creates a configured core module.
   * 
   * @static
   * @method forRoot
   * @returns {DynamicModule} The configured core module
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