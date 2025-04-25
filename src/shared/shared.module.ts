/**
 * Shared module that provides common components and services.
 * This module exports components that can be used across the application.
 * It is marked as @Global() to make its exports available throughout the application
 * without needing to import it in each module.
 * 
 * @module SharedModule
 * @requires @nestjs/common
 * @requires @nestjs/terminus
 * @requires @nestjs/axios
 * @requires ../logger/logger.module
 * 
 * @example
 * // The module is automatically available in other modules due to @Global()
 * @Injectable()
 * export class SomeService {
 *   constructor(private readonly loggerService: LoggerService) {}
 * }
 */

import { Module, Global } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { ErrorMiddleware } from './middleware/error.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '../logger/logger.module';

/**
 * Shared module that exports common components.
 * This module provides application-wide services and utilities:
 * - Health checks (via @nestjs/terminus)
 * - HTTP functionality (via @nestjs/axios)
 * - Logging services
 * - Error handling middleware
 * - Request logging middleware
 * 
 * @class SharedModule
 * @description Provides shared components and services
 * 
 * @property {TerminusModule} TerminusModule - Health check functionality
 * @property {HttpModule} HttpModule - HTTP client functionality
 * @property {LoggerModule} LoggerModule - Logging functionality
 * @property {HealthController} HealthController - Health check endpoints
 * @property {ErrorMiddleware} ErrorMiddleware - Global error handling
 * @property {LoggerMiddleware} LoggerMiddleware - Request logging
 */
@Global()
@Module({
  imports: [
    TerminusModule,
    HttpModule,
    LoggerModule,
  ],
  controllers: [HealthController],
  providers: [ErrorMiddleware, LoggerMiddleware],
  exports: [ErrorMiddleware, LoggerMiddleware],
})
export class SharedModule {} 