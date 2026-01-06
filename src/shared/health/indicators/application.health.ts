import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

/**
 * Application health indicator for monitoring application-specific metrics.
 */
@Injectable()
export class ApplicationHealthIndicator extends HealthIndicator {
  private readonly startTime: Date;

  constructor(private readonly configService: ConfigService) {
    super();
    this.startTime = new Date();
  }

  /**
   * Check application uptime and basic status.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async checkUptime(key: string): Promise<HealthIndicatorResult> {
    try {
      const now = new Date();
      const uptimeMs = now.getTime() - this.startTime.getTime();
      const uptimeSeconds = Math.floor(uptimeMs / 1000);
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      const uptimeDays = Math.floor(uptimeHours / 24);

      const uptimeFormatted = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;

      return this.getStatus(key, true, {
        startTime: this.startTime.toISOString(),
        currentTime: now.toISOString(),
        uptimeMs,
        uptimeFormatted,
        message: 'Application is running',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uptime check failed';
      const errorName = error instanceof Error ? error.name : 'UptimeError';

      throw new HealthCheckError(
        'Application uptime check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }

  /**
   * Check application configuration and environment.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async checkConfiguration(key: string): Promise<HealthIndicatorResult> {
    try {
      const environment = this.configService.get('NODE_ENV', 'development');
      const port = this.configService.get('PORT', 3000);
      const version = this.configService.get('npm_package_version', '0.0.0');

      // Check critical configuration values
      const criticalConfigs = [
        { name: 'NODE_ENV', value: environment, required: true },
        { name: 'PORT', value: port, required: true },
      ];

      const missingConfigs = criticalConfigs.filter(
        (config) => config.required && (!config.value || config.value === '')
      );

      if (missingConfigs.length > 0) {
        throw new HealthCheckError(
          'Configuration check failed',
          this.getStatus(key, false, {
            missingConfigs: missingConfigs.map((c) => c.name),
            message: `Missing required configuration: ${missingConfigs.map((c) => c.name).join(', ')}`,
          })
        );
      }

      return this.getStatus(key, true, {
        environment,
        port,
        version,
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        message: 'Application configuration is valid',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Configuration check failed';
      const errorName = error instanceof Error ? error.name : 'ConfigurationError';

      throw new HealthCheckError(
        'Application configuration check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }

  /**
   * Check application performance metrics.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async checkPerformance(key: string): Promise<HealthIndicatorResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const loadAverage = process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0];

      // Convert memory usage to MB
      const memoryUsageMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      };

      // Check if memory usage is within acceptable limits
      const maxHeapUsageMB = 512; // 512MB limit
      const isMemoryHealthy = memoryUsageMB.heapUsed < maxHeapUsageMB;

      if (!isMemoryHealthy) {
        throw new HealthCheckError(
          'Performance check failed',
          this.getStatus(key, false, {
            memoryUsageMB,
            maxHeapUsageMB,
            cpuUsage,
            loadAverage,
            message: `Memory usage ${memoryUsageMB.heapUsed}MB exceeds limit ${maxHeapUsageMB}MB`,
          })
        );
      }

      return this.getStatus(key, true, {
        memoryUsageMB,
        cpuUsage,
        loadAverage,
        message: 'Application performance is healthy',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Performance check failed';
      const errorName = error instanceof Error ? error.name : 'PerformanceError';

      throw new HealthCheckError(
        'Application performance check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }

  /**
   * Check application dependencies and services.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async checkDependencies(key: string): Promise<HealthIndicatorResult> {
    try {
      // Simulate checking various application dependencies
      const dependencies = [
        { name: 'Logger Service', status: 'healthy', responseTime: 5 },
        { name: 'Cache Service', status: 'healthy', responseTime: 12 },
        { name: 'Config Service', status: 'healthy', responseTime: 3 },
        { name: 'View Engine', status: 'healthy', responseTime: 8 },
      ];

      // Simulate occasional dependency issues
      if (Math.random() > 0.95) {
        dependencies[1].status = 'unhealthy';
        dependencies[1].responseTime = 5000;
      }

      const unhealthyDependencies = dependencies.filter((dep) => dep.status !== 'healthy');

      if (unhealthyDependencies.length > 0) {
        throw new HealthCheckError(
          'Dependencies check failed',
          this.getStatus(key, false, {
            dependencies,
            unhealthyCount: unhealthyDependencies.length,
            totalCount: dependencies.length,
            message: `${unhealthyDependencies.length} dependencies are unhealthy`,
          })
        );
      }

      return this.getStatus(key, true, {
        dependencies,
        healthyCount: dependencies.length,
        totalCount: dependencies.length,
        message: 'All application dependencies are healthy',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Dependencies check failed';
      const errorName = error instanceof Error ? error.name : 'DependenciesError';

      throw new HealthCheckError(
        'Application dependencies check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }
}
