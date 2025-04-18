/**
 * Shared module that provides common components and services.
 * This module exports components that can be used across the application.
 * 
 * @module SharedModule
 * @requires @nestjs/common
 */

import { Module, Global } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { ErrorMiddleware } from './middleware/error.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

/**
 * Shared module that exports common components.
 * 
 * @class SharedModule
 * @description Provides shared components and services
 */
@Global()
@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [ErrorMiddleware, LoggerMiddleware],
  exports: [ErrorMiddleware, LoggerMiddleware],
})
export class SharedModule {} 