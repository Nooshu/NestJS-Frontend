import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { loggingConfig } from './logging.config';

/**
 * Configuration service
 * Provides type-safe access to configuration values
 */
@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  /**
   * Get application port
   */
  get port(): number {
    return this.configService.get<number>('port') ?? 3000;
  }

  /**
   * Get application environment
   */
  get environment(): string {
    return this.configService.get<string>('environment') ?? 'development';
  }

  /**
   * Get views configuration
   */
  get views() {
    return {
      directory: this.configService.get<string>('views.directory') ?? 'src/views',
      cache: this.configService.get<boolean>('views.cache') ?? false,
    };
  }

  /**
   * Get public assets configuration
   */
  get public() {
    return {
      directory: this.configService.get<string>('public.directory') ?? 'src/public',
    };
  }

  /**
   * Get security configuration
   */
  get security() {
    return {
      cors: {
        enabled: this.configService.get<boolean>('security.cors.enabled') ?? false,
        origin: this.configService.get<string>('security.cors.origin') ?? '*',
      },
      csrf: {
        enabled: this.configService.get<boolean>('security.csrf.enabled') ?? true,
        cookieName: this.configService.get<string>('security.csrf.cookieName') ?? 'XSRF-TOKEN',
        headerName: this.configService.get<string>('security.csrf.headerName') ?? 'X-XSRF-TOKEN',
        cookieOptions: {
          httpOnly: this.configService.get<boolean>('security.csrf.cookieOptions.httpOnly') ?? true,
          secure: this.configService.get<boolean>('security.csrf.cookieOptions.secure') ?? true,
          sameSite: this.configService.get<string>('security.csrf.cookieOptions.sameSite') ?? 'strict',
        },
      },
      csp: {
        enabled: this.configService.get<boolean>('security.csp.enabled') ?? true,
        directives: this.configService.get<any>('security.csp.directives') ?? {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    };
  }

  /**
   * Get database configuration
   */
  get database() {
    return {
      type: this.configService.get<string>('database.type') ?? 'postgres',
      host: this.configService.get<string>('database.host') ?? 'localhost',
      port: this.configService.get<number>('database.port') ?? 5432,
      username: this.configService.get<string>('database.username') ?? 'postgres',
      password: this.configService.get<string>('database.password') ?? 'postgres',
      database: this.configService.get<string>('database.database') ?? 'nestjs_frontend',
      synchronize: this.configService.get<boolean>('database.synchronize') ?? false,
      logging: this.configService.get<boolean>('database.logging') ?? false,
    };
  }

  /**
   * Get Redis configuration
   */
  get redis() {
    return {
      enabled: this.configService.get<boolean>('redis.enabled') ?? false,
      host: this.configService.get<string>('redis.host') ?? 'localhost',
      port: this.configService.get<number>('redis.port') ?? 6379,
      password: this.configService.get<string>('redis.password') ?? '',
      db: this.configService.get<number>('redis.db') ?? 0,
    };
  }

  /**
   * Get logging configuration
   */
  get logging() {
    return {
      base: {
        appName: this.configService.get<string>('APP_NAME') || loggingConfig.base.appName,
        environment: this.configService.get<string>('NODE_ENV') || loggingConfig.base.environment,
        level: this.configService.get<string>('LOG_LEVEL') || loggingConfig.base.level,
        prettyPrint: this.configService.get<string>('NODE_ENV') === 'development',
      },
      file: {
        enabled: this.configService.get<boolean>('LOG_FILE') || loggingConfig.file.enabled,
        path: this.configService.get<string>('LOG_FILE_PATH') || loggingConfig.file.path,
        maxSize: this.configService.get<number>('LOG_FILE_MAX_SIZE') || loggingConfig.file.maxSize,
        maxFiles: this.configService.get<number>('LOG_FILE_MAX_FILES') || loggingConfig.file.maxFiles,
      },
      console: {
        enabled: this.configService.get<boolean>('LOG_CONSOLE') ?? loggingConfig.console.enabled,
        colors: this.configService.get<string>('NODE_ENV') === 'development',
      },
      audit: {
        enabled: this.configService.get<boolean>('LOG_AUDIT_ENABLED') ?? loggingConfig.audit.enabled,
        include: loggingConfig.audit.include,
        exclude: loggingConfig.audit.exclude,
        maskSensitiveData: loggingConfig.audit.maskSensitiveData,
        sensitiveFields: loggingConfig.audit.sensitiveFields,
      },
      monitoring: {
        enabled: this.configService.get<boolean>('LOG_MONITORING_ENABLED') ?? loggingConfig.monitoring.enabled,
        metrics: loggingConfig.monitoring.metrics,
        alerting: {
          enabled: loggingConfig.monitoring.alerting.enabled,
          thresholds: {
            errorRate: this.configService.get<number>('LOG_MONITORING_ERROR_RATE_THRESHOLD') || loggingConfig.monitoring.alerting.thresholds.errorRate,
            responseTime: this.configService.get<number>('LOG_MONITORING_RESPONSE_TIME_THRESHOLD') || loggingConfig.monitoring.alerting.thresholds.responseTime,
            memoryUsage: this.configService.get<number>('LOG_MONITORING_MEMORY_USAGE_THRESHOLD') || loggingConfig.monitoring.alerting.thresholds.memoryUsage,
          },
        },
      },
    };
  }

  /**
   * Get performance monitoring configuration
   */
  get performance() {
    return {
      enabled: this.configService.get<boolean>('performance.enabled') ?? true,
      samplingRate: this.configService.get<number>('performance.samplingRate') ?? 1,
      maxEntries: this.configService.get<number>('performance.maxEntries') ?? 100,
      reportOnUnload: this.configService.get<boolean>('performance.reportOnUnload') ?? true,
    };
  }

  /**
   * Get node environment
   */
  get nodeEnv(): string {
    return this.configService.get<string>('nodeEnv') ?? 'development';
  }

  /**
   * Get NPM package version
   */
  get npmPackageVersion(): string {
    return this.configService.get<string>('npmPackageVersion') ?? '0.0.0';
  }
} 