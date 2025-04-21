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
import { securityConfig } from '../config/security.config';

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
    ThrottlerModule.forRoot(securityConfig.throttler),
  ],
})
export class SecurityModule {} 