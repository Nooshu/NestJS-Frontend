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

// Mock DatabaseHealthIndicator to avoid real database connections during testing
class MockDatabaseHealthIndicator extends HealthIndicator {
  isHealthy = jest.fn().mockResolvedValue(
    this.getStatus('database', true, {
      responseTime: 43,
      message: 'Database is responsive',
    })
  );
}

// Mock RedisHealthIndicator to avoid real Redis connections during testing
class MockRedisHealthIndicator extends HealthIndicator {
  isHealthy = jest.fn().mockResolvedValue(
    this.getStatus('redis', true, {
      responseTime: 12,
      message: 'Redis is responsive',
    })
  );

  checkMemoryUsage = jest.fn().mockResolvedValue(
    this.getStatus('redis_memory', true, {
      usedMemory: '1.2MB',
      maxMemory: '10MB',
      memoryUsage: 12,
      message: 'Redis memory usage is healthy',
    })
  );
}

// Mock ApplicationHealthIndicator to avoid real application checks during testing
class MockApplicationHealthIndicator extends HealthIndicator {
  checkUptime = jest.fn().mockResolvedValue(
    this.getStatus('uptime', true, {
      startTime: new Date().toISOString(),
      currentTime: new Date().toISOString(),
      uptimeMs: 60000,
      uptimeFormatted: '0d 0h 1m 0s',
      message: 'Application is running',
    })
  );

  checkConfiguration = jest.fn().mockResolvedValue(
    this.getStatus('configuration', true, {
      environment: 'test',
      port: 3000,
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      message: 'Application configuration is valid',
    })
  );

  checkPerformance = jest.fn().mockResolvedValue(
    this.getStatus('performance', true, {
      memoryUsageMB: {
        rss: 50,
        heapTotal: 100,
        heapUsed: 30,
        external: 10,
      },
      cpuUsage: { user: 1000, system: 500 },
      loadAverage: [0.5, 0.3, 0.2],
      message: 'Application performance is healthy',
    })
  );

  checkDependencies = jest.fn().mockResolvedValue(
    this.getStatus('dependencies', true, {
      dependencies: [
        { name: 'Logger Service', status: 'healthy', responseTime: 5 },
        { name: 'Cache Service', status: 'healthy', responseTime: 12 },
        { name: 'Config Service', status: 'healthy', responseTime: 3 },
        { name: 'View Engine', status: 'healthy', responseTime: 8 },
      ],
      healthyCount: 4,
      totalCount: 4,
      message: 'All application dependencies are healthy',
    })
  );
}

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let mockHttpHealthIndicator: MockHttpHealthIndicator;
  let mockDatabaseHealthIndicator: MockDatabaseHealthIndicator;
  let mockRedisHealthIndicator: MockRedisHealthIndicator;
  let mockApplicationHealthIndicator: MockApplicationHealthIndicator;

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
        {
          provide: DatabaseHealthIndicator,
          useClass: MockDatabaseHealthIndicator,
        },
        {
          provide: RedisHealthIndicator,
          useClass: MockRedisHealthIndicator,
        },
        {
          provide: HttpHealthIndicator,
          useClass: MockHttpHealthIndicator,
        },
        {
          provide: ApplicationHealthIndicator,
          useClass: MockApplicationHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mockHttpHealthIndicator = module.get<MockHttpHealthIndicator>(HttpHealthIndicator);
    mockDatabaseHealthIndicator = module.get<MockDatabaseHealthIndicator>(DatabaseHealthIndicator);
    mockRedisHealthIndicator = module.get<MockRedisHealthIndicator>(RedisHealthIndicator);
    mockApplicationHealthIndicator = module.get<MockApplicationHealthIndicator>(ApplicationHealthIndicator);
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
      const result = await controller.detailed();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('memory_heap');
      expect(result.info).toHaveProperty('uptime');
      expect(result.info).toHaveProperty('configuration');
      expect(result.info).toHaveProperty('performance');
    });
  });

  describe('checkDatabase', () => {
    it('should return database health check results', async () => {
      const result = await controller.checkDatabase();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('database');
      expect(mockDatabaseHealthIndicator.isHealthy).toHaveBeenCalledWith('database');
    });
  });

  describe('checkRedis', () => {
    it('should return redis health check results', async () => {
      const result = await controller.checkRedis();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('redis');
      expect(result.info).toHaveProperty('redis_memory');
      expect(mockRedisHealthIndicator.isHealthy).toHaveBeenCalledWith('redis');
      expect(mockRedisHealthIndicator.checkMemoryUsage).toHaveBeenCalledWith('redis_memory');
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
      expect(result.info).toHaveProperty('performance');
    });
  });

  describe('checkReadiness', () => {
    it('should return readiness probe results', async () => {
      const result = await controller.checkReadiness();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('configuration');
      expect(result.info).toHaveProperty('dependencies');
    });
  });

  describe('checkLiveness', () => {
    it('should return liveness probe results', async () => {
      const result = await controller.checkLiveness();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result.info).toHaveProperty('memory_heap_live');
      expect(result.info).toHaveProperty('uptime');
    });
  });
});
