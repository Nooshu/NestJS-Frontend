/**
 * Root module of the NestJS application.
 * Configures the application's dependencies and providers.
 * This module serves as the entry point for the application's dependency injection system
 * and defines the application's structure and available components.
 * 
 * @module AppModule
 * @requires @nestjs/common
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

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
  // Currently no imported modules as this is the root module
  imports: [],
  
  // Register the main application controller
  controllers: [AppController],
  
  // Currently no providers as we're using the basic setup
  providers: [],
})
export class AppModule {} 