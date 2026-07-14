/**
 * Shared module that provides common components and services.
 * This module exports components that can be used across the application.
 * It is marked global (Nest `\@Global`) so exports are available without re-importing.
 *
 * @example
 * ```ts
 * // Available in other modules once SharedModule is loaded
 * export class SomeService {
 *   constructor(private readonly loggerService: LoggerService) {}
 * }
 * ```
 */

import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from '../logger/logger.module';
import { HealthModule } from './health/health.module';
import { ErrorMiddleware } from './middleware/error.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';

/**
 * Shared module that exports common components.
 * This module provides application-wide services and utilities:
 * - Health checks (Terminus)
 * - HTTP functionality (Axios)
 * - Logging services
 * - Error handling middleware
 * - Request logging middleware
 */
@Global()
@Module({
  imports: [TerminusModule, HttpModule, LoggerModule, HealthModule],
  providers: [ErrorMiddleware, LoggerMiddleware],
  exports: [ErrorMiddleware, LoggerMiddleware],
})
export class SharedModule {}
