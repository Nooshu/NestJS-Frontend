/**
 * Views module that provides template rendering functionality.
 * This module configures the Nunjucks template engine and related services.
 *
 * @module ViewsModule
 * @requires @nestjs/common
 * @requires @nestjs/platform-express
 */

import { type DynamicModule, Module } from '@nestjs/common';
import { ViewEngineService } from './view-engine.service';
import { SharedServicesModule } from '../shared/services/shared-services.module';

/**
 * Views module that provides template rendering functionality.
 *
 * @class ViewsModule
 * @description Configures and provides template rendering services
 */
@Module({})
export class ViewsModule {
  /**
   * Creates a configured views module.
   *
   * @static
   * @method forRoot
   * @returns {DynamicModule} The configured views module
   */
  static forRoot(): DynamicModule {
    return {
      module: ViewsModule,
      imports: [SharedServicesModule],
      providers: [ViewEngineService],
      exports: [ViewEngineService],
    };
  }
}
