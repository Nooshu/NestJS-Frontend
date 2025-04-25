/**
 * Logger Module for NestJS Application
 * 
 * This module configures and provides a Winston-based logging system for the application.
 * It sets up multiple logging transports and formats to ensure comprehensive logging:
 * - Console transport for development with colored output
 * - File transport for persistent logging
 * - Separate error log file for easier error tracking
 * 
 * The module exports the LoggerService which can be injected into other parts of
 * the application for consistent logging across all components.
 * 
 * @module LoggerModule
 * @requires @nestjs/common
 * @requires nest-winston
 * @requires winston
 */
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { LoggerService } from './logger.service';
import { loggingConfig } from '../shared/config/logging.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRoot({
      level: loggingConfig.base.level,
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
      transports: [
        /**
         * Console Transport Configuration
         * 
         * Provides colored, formatted output to the console during development.
         * Includes timestamp, context, and log level in a human-readable format.
         * Stack traces are included for error logs.
         */
        ...(loggingConfig.console.enabled ? [
          new transports.Console({
            format: format.combine(
              format.timestamp(),
              format.colorize(),
              format.printf(({ timestamp, level, message, context, trace }) => {
                return `${timestamp} [${context}] ${level}: ${message}${
                  trace ? `\n${trace}` : ''
                }`;
              }),
            ),
          }),
        ] : []),
        /**
         * File Transport Configuration
         * 
         * Writes all logs to a file in JSON format for persistent storage.
         * Includes timestamp and structured metadata for better log analysis.
         */
        ...(loggingConfig.file.enabled ? [
          new transports.File({
            filename: loggingConfig.file.path,
            maxsize: loggingConfig.file.maxSize,
            maxFiles: loggingConfig.file.maxFiles,
            format: format.combine(
              format.timestamp(),
              format.json(),
            ),
          }),
          /**
           * Error File Transport Configuration
           * 
           * Writes only error-level logs to a separate file for easier error tracking.
           * Uses JSON format for structured error logging.
           */
          new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: loggingConfig.file.maxSize,
            maxFiles: loggingConfig.file.maxFiles,
            format: format.combine(
              format.timestamp(),
              format.json(),
            ),
          }),
        ] : []),
      ],
    }),
  ],
  providers: [
    LoggerService,
    {
      provide: 'LOGGING_CONFIG',
      useValue: loggingConfig,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {} 