import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { HttpHealthIndicator } from './indicators/http.health';
import { ApplicationHealthIndicator } from './indicators/application.health';

/**
 * Comprehensive health check module that provides various health indicators
 * and monitoring capabilities for the application.
 */
@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    HttpHealthIndicator,
    ApplicationHealthIndicator,
  ],
  exports: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    HttpHealthIndicator,
    ApplicationHealthIndicator,
  ],
})
export class HealthModule {}
