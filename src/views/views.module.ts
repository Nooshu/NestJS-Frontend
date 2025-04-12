/**
 * Views module that provides template rendering functionality.
 * This module configures the Nunjucks template engine and related services.
 * 
 * @module ViewsModule
 * @requires @nestjs/common
 * @requires @nestjs/platform-express
 */

import { Module, DynamicModule } from '@nestjs/common';
import { ViewEngineService } from './view-engine.service';

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
      providers: [ViewEngineService],
      exports: [ViewEngineService],
    };
  }
} 