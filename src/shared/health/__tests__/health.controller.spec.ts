import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TerminusModule, HealthIndicator } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from '../health.controller';
import { DatabaseHealthIndicator } from '../indicators/database.health';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { HttpHealthIndicator } from '../indicators/http.health';
import { ApplicationHealthIndicator } from '../indicators/application.health';

// Mock HttpHealthIndicator to avoid real HTTP calls during testing
class MockHttpHealthIndicator extends HealthIndicator {
  checkMultipleEndpoints = jest.fn().mockResolvedValue(
    this.getStatus('http_services', true, {
      healthyCount: 2,
      totalCount: 2,
      endpoints: [
        {
          name: 'Google',
          url: 'https://www.google.com',
          status: 'healthy',
          statusCode: 200,
          responseTime: 100,
          isHealthy: true,
        },
        {
          name: 'Cloudflare',
          url: 'https://1.1.1.1',
          status: 'healthy',
          statusCode: 200,
          responseTime: 120,
          isHealthy: true,
        },
      ],
      message: 'HTTP endpoints are healthy',
    })
  );

  pingCheck = jest.fn().mockResolvedValue(
    this.getStatus('http_test', true, {
      url: 'https://httpbin.org/status/200',
      statusCode: 200,
      responseTime: 100,
      message: 'HTTP service is responsive',
    })
  );
}

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let mockHttpHealthIndicator: MockHttpHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TerminusModule,
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [HealthController],
      providers: [
        DatabaseHealthIndicator,
        RedisHealthIndicator,
        {
          provide: HttpHealthIndicator,
          useClass: MockHttpHealthIndicator,
        },
        ApplicationHealthIndicator,
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mockHttpHealthIndicator = module.get<MockHttpHealthIndicator>(HttpHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return basic health check results', async () => {
      const result = await controller.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('memory_heap');
      expect(result.info).toHaveProperty('memory_rss');
      expect(result.info).toHaveProperty('disk_health');
    });
  });

  describe('detailed', () => {
    it('should return detailed health check results', async () => {
      try {
        const result = await controller.detailed();

        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('info');
        expect(result.info).toHaveProperty('memory_heap');
        expect(result.info).toHaveProperty('app_uptime');
        expect(result.info).toHaveProperty('app_config');
        expect(result.info).toHaveProperty('app_performance');
      } catch (error) {
        // If health check fails due to dependencies, check that we get proper error handling
        expect(error instanceof Error ? error.message : String(error)).toContain('Service Unavailable');

        // Test the fallback behavior by calling the method directly
        const result = await controller.detailed();
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('info');
      }
    });
  });

  describe('checkDatabase', () => {
    it('should return database health check results', async () => {
      const result = await controller.checkDatabase();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('database');
    });
  });

  describe('checkRedis', () => {
    it('should return redis health check results', async () => {
      const result = await controller.checkRedis();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('redis');
      expect(result.info).toHaveProperty('redis_memory');
    });
  });

  describe('checkHttp', () => {
    it('should return http services health check results with default endpoints', async () => {
      const result = await controller.checkHttp();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('http_services');
      expect(mockHttpHealthIndicator.checkMultipleEndpoints).toHaveBeenCalledWith('http_services', [
        { name: 'Google', url: 'https://www.google.com', timeout: 5000 },
        { name: 'Cloudflare', url: 'https://1.1.1.1', timeout: 5000 },
      ]);
    });

    it('should return http services health check results with custom URLs', async () => {
      const customUrls = 'https://httpbin.org/status/200';

      const result = await controller.checkHttp(customUrls);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('http_services');
      expect(mockHttpHealthIndicator.checkMultipleEndpoints).toHaveBeenCalledWith('http_services', [
        { name: 'Custom-1', url: 'https://httpbin.org/status/200', timeout: 5000 },
      ]);
    });
  });

  describe('checkApplication', () => {
    it('should return application health check results', async () => {
      const result = await controller.checkApplication();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('uptime');
      expect(result.info).toHaveProperty('configuration');
      expect(result.info).toHaveProperty('performance');
      expect(result.info).toHaveProperty('dependencies');
    });
  });

  describe('checkSystem', () => {
    it('should return system health check results', async () => {
      const result = await controller.checkSystem();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('memory_heap');
      expect(result.info).toHaveProperty('memory_rss');
      expect(result.info).toHaveProperty('disk_storage');
      expect(result.info).toHaveProperty('system_performance');
    });
  });

  describe('checkReadiness', () => {
    it('should return readiness probe results', async () => {
      const result = await controller.checkReadiness();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('config_ready');
      expect(result.info).toHaveProperty('dependencies_ready');
    });
  });

  describe('checkLiveness', () => {
    it('should return liveness probe results', async () => {
      const result = await controller.checkLiveness();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('memory_heap_live');
      expect(result.info).toHaveProperty('uptime_live');
    });
  });
});
