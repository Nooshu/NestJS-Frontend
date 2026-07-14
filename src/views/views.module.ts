/**
 * Views module that provides template rendering functionality.
 * This module configures the Nunjucks template engine and related services.
 */

import { type DynamicModule, Module } from '@nestjs/common';
import { ViewEngineService } from './view-engine.service';
import { SharedServicesModule } from '../shared/services/shared-services.module';

/**
 * Views module that provides template rendering functionality.
 */
@Module({})
export class ViewsModule {
  /**
   * Creates a configured views module.
   *
   * @returns The configured views module
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
