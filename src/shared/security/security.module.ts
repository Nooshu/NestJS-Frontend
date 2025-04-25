/**
 * Security module for the NestJS application.
 * This module provides rate limiting and other security features using @nestjs/throttler.
 * It configures the rate limiting settings from the security configuration.
 * 
 * @module SecurityModule
 * @requires @nestjs/common
 * @requires @nestjs/throttler
 */

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityConfig, SecurityConfigModule } from '../config/security.config';
import { SecurityErrorFilter } from '../filters/security-error.filter';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { configurationSchema } from '../config/configuration.schema';

/**
 * Module that provides security features including rate limiting.
 * Configures the rate limiting settings from the security configuration:
 * - ttl: Time window in milliseconds (default: 60000)
 * - limit: Maximum number of requests per time window (default: 10)
 * 
 * @class SecurityModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
      isGlobal: true,
    }),
    SecurityConfigModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  providers: [
    SecurityConfig,
    SecurityErrorFilter,
  ],
  exports: [
    SecurityConfig,
    SecurityErrorFilter,
  ],
})
export class SecurityModule {} 