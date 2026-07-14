import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthCheckError } from '@nestjs/terminus';
import { ApplicationHealthIndicator } from '../indicators/application.health';

describe('ApplicationHealthIndicator', () => {
  let indicator: ApplicationHealthIndicator;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const values: Record<string, unknown> = {
          NODE_ENV: 'test',
          PORT: 3000,
          npm_package_version: '1.2.3',
        };
        return values[key] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ApplicationHealthIndicator,
          useFactory: () => {
            const instance = new ApplicationHealthIndicator();
            instance.configService = configService;
            return instance;
          },
        },
      ],
    }).compile();

    indicator = module.get(ApplicationHealthIndicator);
  });

  describe('checkUptime', () => {
    it('should return healthy uptime status', async () => {
      const result = await indicator.checkUptime('uptime');

      expect(result.uptime.status).toBe('up');
      expect(result.uptime).toMatchObject({
        message: 'Application is running',
        uptimeFormatted: expect.any(String),
        uptimeMs: expect.any(Number),
      });
    });

    it('should wrap unexpected errors as HealthCheckError', async () => {
      jest.spyOn(indicator as any, 'getStatus').mockImplementationOnce(() => {
        throw new Error('boom');
      });

      await expect(indicator.checkUptime('uptime')).rejects.toThrow(HealthCheckError);
    });

    it('should handle non-Error throws in uptime check', async () => {
      jest.spyOn(indicator as any, 'getStatus').mockImplementationOnce(() => {
        throw 'string-error';
      });

      await expect(indicator.checkUptime('uptime')).rejects.toThrow(HealthCheckError);
    });
  });

  describe('checkConfiguration', () => {
    it('should return healthy configuration status', async () => {
      const result = await indicator.checkConfiguration('config');

      expect(result.config.status).toBe('up');
      expect(result.config).toMatchObject({
        environment: 'test',
        port: 3000,
        version: '1.2.3',
        message: 'Application configuration is valid',
      });
    });

    it('should fail when required configuration is missing', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === 'NODE_ENV') return '';
        if (key === 'PORT') return '';
        return defaultValue;
      });

      await expect(indicator.checkConfiguration('config')).rejects.toThrow(HealthCheckError);
    });

    it('should handle non-Error throws in configuration check', async () => {
      configService.get.mockImplementation(() => {
        throw 'config-broken';
      });

      await expect(indicator.checkConfiguration('config')).rejects.toThrow(HealthCheckError);
    });
  });

  describe('checkPerformance', () => {
    it('should return healthy performance status', async () => {
      const result = await indicator.checkPerformance('performance');

      expect(result.performance.status).toBe('up');
      expect(result.performance).toMatchObject({
        message: 'Application performance is healthy',
        memoryUsageMB: expect.any(Object),
        cpuUsage: expect.any(Object),
        loadAverage: expect.any(Array),
      });
    });

    it('should fail when heap usage exceeds limit', async () => {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 600 * 1024 * 1024,
        heapTotal: 600 * 1024 * 1024,
        heapUsed: 600 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 0,
      });

      await expect(indicator.checkPerformance('performance')).rejects.toThrow(HealthCheckError);
    });

    it('should use zero load average on win32', async () => {
      const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', { value: 'win32' });

      try {
        const result = await indicator.checkPerformance('performance');
        expect(result.performance.loadAverage).toEqual([0, 0, 0]);
      } finally {
        if (originalPlatform) {
          Object.defineProperty(process, 'platform', originalPlatform);
        }
      }
    });

    it('should handle non-Error throws in performance check', async () => {
      jest.spyOn(process, 'memoryUsage').mockImplementation(() => {
        throw 'perf-broken';
      });

      await expect(indicator.checkPerformance('performance')).rejects.toThrow(HealthCheckError);
    });
  });

  describe('checkDependencies', () => {
    it('should return healthy dependencies status', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await indicator.checkDependencies('dependencies');

      expect(result.dependencies.status).toBe('up');
      expect(result.dependencies).toMatchObject({
        message: 'All application dependencies are healthy',
        healthyCount: 4,
        totalCount: 4,
      });
    });

    it('should fail when a dependency is unhealthy', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      await expect(indicator.checkDependencies('dependencies')).rejects.toThrow(HealthCheckError);
    });

    it('should handle non-Error throws in dependencies check', async () => {
      jest.spyOn(Math, 'random').mockImplementation(() => {
        throw 'deps-broken';
      });

      await expect(indicator.checkDependencies('dependencies')).rejects.toThrow(HealthCheckError);
    });
  });
});
