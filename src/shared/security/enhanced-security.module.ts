import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityConfig, SecurityConfigModule } from '../config/security.config';
import { LoggerModule } from '../../logger/logger.module';
import { SecurityErrorFilter } from '../filters/security-error.filter';
import { CspMiddleware } from './middleware/csp.middleware';
import { RateLimitingMiddleware } from '../middleware/rate-limiting.middleware';
import { RequestSanitizationMiddleware } from '../middleware/request-sanitization.middleware';
import { SecurityAuditMiddleware } from '../middleware/security-audit.middleware';
import { SecurityHeadersMiddleware } from '../middleware/security-headers.middleware';
import { CsrfMiddleware } from '../middleware/csrf.middleware';

/**
 * Enhanced Security Module for comprehensive application security.
 *
 * This module provides:
 * - Advanced rate limiting with path-specific configurations
 * - Request sanitization and validation
 * - Security audit logging
 * - Enhanced security headers
 * - CSRF protection
 * - Content Security Policy (CSP)
 * - Security error handling
 *
 * @module EnhancedSecurityModule
 */
@Module({
  imports: [
    ConfigModule,
    SecurityConfigModule,
    LoggerModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute (fallback)
      },
    ]),
  ],
  providers: [
    SecurityConfig,
    SecurityErrorFilter,
    RateLimitingMiddleware,
    RequestSanitizationMiddleware,
    SecurityAuditMiddleware,
    SecurityHeadersMiddleware,
    CsrfMiddleware,
    CspMiddleware,
  ],
  exports: [
    SecurityConfig,
    SecurityErrorFilter,
    RateLimitingMiddleware,
    RequestSanitizationMiddleware,
    SecurityAuditMiddleware,
    SecurityHeadersMiddleware,
    CsrfMiddleware,
    CspMiddleware,
  ],
})
export class EnhancedSecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware in order of importance for security

    // 1. Request sanitization - first line of defense
    consumer.apply(RequestSanitizationMiddleware).forRoutes('*');

    // 2. Rate limiting - prevent abuse
    consumer.apply(RateLimitingMiddleware).forRoutes('*');

    // 3. Security headers - set security policies
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');

    // 4. CSP middleware - content security policy
    consumer.apply(CspMiddleware).forRoutes('*');

    // 5. CSRF protection - for form submissions
    consumer.apply(CsrfMiddleware).forRoutes('*');

    // 6. Security audit logging - monitor and log security events
    consumer.apply(SecurityAuditMiddleware).forRoutes('*');
  }
}
