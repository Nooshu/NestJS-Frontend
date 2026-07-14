import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { HttpHealthIndicator } from './indicators/http.health';
import { ApplicationHealthIndicator } from './indicators/application.health';

/**
 * Health check module — Terminus-backed readiness/liveness and dependency probes.
 *
 * Why custom factories: ApplicationHealthIndicator, HttpHealthIndicator, and
 * RedisHealthIndicator need ConfigService / HttpService injected after
 * construction (legacy indicator APIs). Prefer adjusting factories here rather
 * than spreading config wiring into controllers.
 *
 * Controllers: {@link HealthController}. Exported indicators can be reused by
 * other modules for composed checks.
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
    {
      provide: ApplicationHealthIndicator,
      useFactory: (configService: ConfigService) => {
        const indicator = new ApplicationHealthIndicator();
        indicator.configService = configService;
        return indicator;
      },
      inject: [ConfigService],
    },
    {
      provide: HttpHealthIndicator,
      useFactory: (httpService: HttpService) => {
        const indicator = new HttpHealthIndicator();
        indicator.httpService = httpService;
        return indicator;
      },
      inject: [HttpService],
    },
    {
      provide: RedisHealthIndicator,
      useFactory: (configService: ConfigService) => {
        return new RedisHealthIndicator().init(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    HttpHealthIndicator,
    ApplicationHealthIndicator,
  ],
})
export class HealthModule {}
