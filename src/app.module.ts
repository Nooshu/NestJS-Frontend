/**
 * Root module of the NestJS application.
 * Configures the application's dependencies and providers.
 * 
 * @module AppModule
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

/**
 * @class AppModule
 * @description Root module that bootstraps the application
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {} 