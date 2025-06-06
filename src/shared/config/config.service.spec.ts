import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { loggingConfig } from './logging.config';

type SecurityConfigKeys = 
  | 'security.cors.enabled'
  | 'security.cors.origin'
  | 'security.csrf.enabled'
  | 'security.csrf.cookieName'
  | 'security.csrf.headerName'
  | 'security.csrf.cookieOptions.httpOnly'
  | 'security.csrf.cookieOptions.secure'
  | 'security.csrf.cookieOptions.sameSite'
  | 'security.csp.enabled'
  | 'security.csp.directives';

type DatabaseConfigKeys =
  | 'database.type'
  | 'database.host'
  | 'database.port'
  | 'database.username'
  | 'database.password'
  | 'database.database'
  | 'database.synchronize'
  | 'database.logging';

type RedisConfigKeys =
  | 'redis.enabled'
  | 'redis.host'
  | 'redis.port'
  | 'redis.password'
  | 'redis.db';

type LoggingConfigKeys =
  | 'APP_NAME'
  | 'NODE_ENV'
  | 'LOG_LEVEL'
  | 'LOG_FILE'
  | 'LOG_FILE_PATH'
  | 'LOG_FILE_MAX_SIZE'
  | 'LOG_FILE_MAX_FILES'
  | 'LOG_CONSOLE'
  | 'LOG_AUDIT_ENABLED'
  | 'LOG_MONITORING_ENABLED'
  | 'LOG_MONITORING_ERROR_RATE_THRESHOLD'
  | 'LOG_MONITORING_RESPONSE_TIME_THRESHOLD'
  | 'LOG_MONITORING_MEMORY_USAGE_THRESHOLD';

type PerformanceConfigKeys =
  | 'performance.enabled'
  | 'performance.samplingRate'
  | 'performance.maxEntries'
  | 'performance.reportOnUnload';

describe('ConfigService', () => {
  let service: ConfigService;
  let module: TestingModule;

  const mockNestConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: NestConfigService,
          useValue: mockNestConfigService,
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a new instance with injected ConfigService', () => {
      const newService = new ConfigService(mockNestConfigService as any);
      expect(newService).toBeDefined();
      expect(newService).toBeInstanceOf(ConfigService);
    });

    it('should use injected ConfigService for all getters', () => {
      const configService = new ConfigService(mockNestConfigService as any);
      mockNestConfigService.get.mockReturnValue('test-value');
      
      // Call all getters to ensure they use the injected service
      configService.port;
      configService.environment;
      configService.views;
      configService.public;
      configService.security;
      configService.database;
      configService.redis;
      configService.logging;
      configService.performance;
      configService.nodeEnv;
      configService.npmPackageVersion;

      expect(mockNestConfigService.get).toHaveBeenCalled();
    });
  });

  describe('port', () => {
    it('should return default port 3000 when not configured', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      expect(service.port).toBe(3000);
    });

    it('should return configured port', () => {
      mockNestConfigService.get.mockReturnValue(4000);
      expect(service.port).toBe(4000);
    });
  });

  describe('environment', () => {
    it('should return default environment "development" when not configured', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      expect(service.environment).toBe('development');
    });

    it('should return configured environment', () => {
      mockNestConfigService.get.mockReturnValue('production');
      expect(service.environment).toBe('production');
    });
  });

  describe('views', () => {
    it('should return default views configuration', () => {
      mockNestConfigService.get.mockImplementation((key) => {
        if (key === 'views.directory') return undefined;
        if (key === 'views.cache') return undefined;
        return null;
      });

      expect(service.views).toEqual({
        directory: 'src/views',
        cache: false,
      });
    });

    it('should return configured views settings', () => {
      mockNestConfigService.get.mockImplementation((key) => {
        if (key === 'views.directory') return 'custom/views';
        if (key === 'views.cache') return true;
        return null;
      });

      expect(service.views).toEqual({
        directory: 'custom/views',
        cache: true,
      });
    });

    it('should handle null values for views configuration', () => {
      mockNestConfigService.get.mockImplementation((key) => {
        if (key === 'views.directory') return null;
        if (key === 'views.cache') return null;
        return undefined;
      });

      expect(service.views).toEqual({
        directory: 'src/views',
        cache: false,
      });
    });
  });

  describe('public', () => {
    it('should return default public configuration', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      expect(service.public).toEqual({
        directory: 'src/public',
      });
    });

    it('should return configured public settings', () => {
      mockNestConfigService.get.mockReturnValue('custom/public');
      expect(service.public).toEqual({
        directory: 'custom/public',
      });
    });
  });

  describe('security', () => {
    it('should return default security configuration', () => {
      mockNestConfigService.get.mockImplementation((key: SecurityConfigKeys) => {
        const defaults: Record<SecurityConfigKeys, boolean | string | any> = {
          'security.cors.enabled': false,
          'security.cors.origin': '*',
          'security.csrf.enabled': true,
          'security.csrf.cookieName': 'XSRF-TOKEN',
          'security.csrf.headerName': 'X-XSRF-TOKEN',
          'security.csrf.cookieOptions.httpOnly': true,
          'security.csrf.cookieOptions.secure': true,
          'security.csrf.cookieOptions.sameSite': 'strict',
          'security.csp.enabled': true,
          'security.csp.directives': undefined,
        };
        return defaults[key] ?? undefined;
      });

      const security = service.security;
      expect(security.cors).toEqual({
        enabled: false,
        origin: '*',
      });
      expect(security.csrf).toEqual({
        enabled: true,
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
        cookieOptions: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        },
      });
      expect(security.csp).toEqual({
        enabled: true,
        directives: {
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
      });
    });

    it('should handle undefined values for security configuration', () => {
      mockNestConfigService.get.mockImplementation((key: SecurityConfigKeys) => {
        const defaults: Record<SecurityConfigKeys, undefined> = {
          'security.cors.enabled': undefined,
          'security.cors.origin': undefined,
          'security.csrf.enabled': undefined,
          'security.csrf.cookieName': undefined,
          'security.csrf.headerName': undefined,
          'security.csrf.cookieOptions.httpOnly': undefined,
          'security.csrf.cookieOptions.secure': undefined,
          'security.csrf.cookieOptions.sameSite': undefined,
          'security.csp.enabled': undefined,
          'security.csp.directives': undefined,
        };
        return defaults[key];
      });

      const security = service.security;
      expect(security.cors).toEqual({
        enabled: false,
        origin: '*',
      });
      expect(security.csrf).toEqual({
        enabled: true,
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
        cookieOptions: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        },
      });
      expect(security.csp).toEqual({
        enabled: true,
        directives: expect.any(Object),
      });
    });

    it('should handle custom CSP directives', () => {
      const customDirectives = {
        defaultSrc: ["'self'", 'https://trusted.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://trusted-scripts.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://trusted-styles.com'],
        imgSrc: ["'self'", 'data:', 'https://trusted-images.com'],
        connectSrc: ["'self'", 'https://trusted-api.com'],
        fontSrc: ["'self'", 'https://trusted-fonts.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      };

      mockNestConfigService.get.mockImplementation((key: SecurityConfigKeys) => {
        if (key === 'security.csp.directives') return customDirectives;
        return undefined;
      });

      const security = service.security;
      expect(security.csp.directives).toEqual(customDirectives);
    });

    it('should return custom security configuration with null values', () => {
      mockNestConfigService.get.mockImplementation((key: SecurityConfigKeys) => {
        const customValues: Record<SecurityConfigKeys, boolean | string | null | any> = {
          'security.cors.enabled': null,
          'security.cors.origin': null,
          'security.csrf.enabled': null,
          'security.csrf.cookieName': null,
          'security.csrf.headerName': null,
          'security.csrf.cookieOptions.httpOnly': null,
          'security.csrf.cookieOptions.secure': null,
          'security.csrf.cookieOptions.sameSite': null,
          'security.csp.enabled': null,
          'security.csp.directives': null,
        };
        return customValues[key] ?? undefined;
      });

      const security = service.security;
      expect(security.cors).toEqual({
        enabled: false,
        origin: '*',
      });
      expect(security.csrf).toEqual({
        enabled: true,
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
        cookieOptions: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        },
      });
      expect(security.csp).toEqual({
        enabled: true,
        directives: expect.any(Object),
      });
    });

    it('should return custom security configuration', () => {
      mockNestConfigService.get.mockImplementation((key: SecurityConfigKeys) => {
        const customValues: Record<SecurityConfigKeys, boolean | string | any> = {
          'security.cors.enabled': true,
          'security.cors.origin': 'https://example.com',
          'security.csrf.enabled': false,
          'security.csrf.cookieName': 'custom-csrf-token',
          'security.csrf.headerName': 'custom-csrf-header',
          'security.csrf.cookieOptions.httpOnly': false,
          'security.csrf.cookieOptions.secure': false,
          'security.csrf.cookieOptions.sameSite': 'lax',
          'security.csp.enabled': false,
          'security.csp.directives': undefined,
        };
        return customValues[key] ?? undefined;
      });

      const security = service.security;
      expect(security.cors).toEqual({
        enabled: true,
        origin: 'https://example.com',
      });
      expect(security.csrf).toEqual({
        enabled: false,
        cookieName: 'custom-csrf-token',
        headerName: 'custom-csrf-header',
        cookieOptions: {
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
        },
      });
      expect(security.csp).toEqual({
        enabled: false,
        directives: {
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
      });
    });

    it('should handle all security configuration paths', () => {
      // Test each security configuration path individually
      const testCases = [
        { key: 'security.cors.enabled', value: true },
        { key: 'security.cors.origin', value: 'https://test.com' },
        { key: 'security.csrf.enabled', value: false },
        { key: 'security.csrf.cookieName', value: 'test-csrf' },
        { key: 'security.csrf.headerName', value: 'test-header' },
        { key: 'security.csrf.cookieOptions.httpOnly', value: false },
        { key: 'security.csrf.cookieOptions.secure', value: false },
        { key: 'security.csrf.cookieOptions.sameSite', value: 'lax' },
        { key: 'security.csp.enabled', value: false },
        { key: 'security.csp.directives', value: { test: ['test'] } },
      ];

      for (const testCase of testCases) {
        mockNestConfigService.get.mockImplementation((key: string) => {
          return key === testCase.key ? testCase.value : undefined;
        });

        const security = service.security;
        expect(security).toBeDefined();
      }
    });

    it('should handle security configuration with all values undefined', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      const security = service.security;
      
      // Verify each property uses its default value
      expect(security.cors.enabled).toBe(false);
      expect(security.cors.origin).toBe('*');
      expect(security.csrf.enabled).toBe(true);
      expect(security.csrf.cookieName).toBe('XSRF-TOKEN');
      expect(security.csrf.headerName).toBe('X-XSRF-TOKEN');
      expect(security.csrf.cookieOptions.httpOnly).toBe(true);
      expect(security.csrf.cookieOptions.secure).toBe(true);
      expect(security.csrf.cookieOptions.sameSite).toBe('strict');
      expect(security.csp.enabled).toBe(true);
      expect(security.csp.directives).toBeDefined();
    });
  });

  describe('database', () => {
    it('should return default database configuration', () => {
      mockNestConfigService.get.mockImplementation((key: DatabaseConfigKeys) => {
        const defaults: Record<DatabaseConfigKeys, string | number | boolean> = {
          'database.type': 'postgres',
          'database.host': 'localhost',
          'database.port': 5432,
          'database.username': 'postgres',
          'database.password': 'postgres',
          'database.database': 'nestjs_frontend',
          'database.synchronize': false,
          'database.logging': false,
        };
        return defaults[key] ?? undefined;
      });

      expect(service.database).toEqual({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'nestjs_frontend',
        synchronize: false,
        logging: false,
      });
    });
  });

  describe('redis', () => {
    it('should return default redis configuration', () => {
      mockNestConfigService.get.mockImplementation((key: RedisConfigKeys) => {
        const defaults: Record<RedisConfigKeys, string | number | boolean> = {
          'redis.enabled': false,
          'redis.host': 'localhost',
          'redis.port': 6379,
          'redis.password': '',
          'redis.db': 0,
        };
        return defaults[key] ?? undefined;
      });

      expect(service.redis).toEqual({
        enabled: false,
        host: 'localhost',
        port: 6379,
        password: '',
        db: 0,
      });
    });
  });

  describe('logging', () => {
    it('should return default logging configuration', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        const defaults: Record<LoggingConfigKeys, undefined> = {
          'APP_NAME': undefined,
          'NODE_ENV': undefined,
          'LOG_LEVEL': undefined,
          'LOG_FILE': undefined,
          'LOG_FILE_PATH': undefined,
          'LOG_FILE_MAX_SIZE': undefined,
          'LOG_FILE_MAX_FILES': undefined,
          'LOG_CONSOLE': undefined,
          'LOG_AUDIT_ENABLED': undefined,
          'LOG_MONITORING_ENABLED': undefined,
          'LOG_MONITORING_ERROR_RATE_THRESHOLD': undefined,
          'LOG_MONITORING_RESPONSE_TIME_THRESHOLD': undefined,
          'LOG_MONITORING_MEMORY_USAGE_THRESHOLD': undefined,
        };
        return defaults[key] ?? undefined;
      });

      const logging = service.logging;
      expect(logging.base).toBeDefined();
      expect(logging.file).toBeDefined();
      expect(logging.console).toBeDefined();
      expect(logging.audit).toBeDefined();
      expect(logging.monitoring).toBeDefined();
    });

    it('should return custom logging configuration', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        const customValues: Record<LoggingConfigKeys, string | boolean | number | undefined> = {
          'APP_NAME': 'custom-app',
          'NODE_ENV': 'production',
          'LOG_LEVEL': 'error',
          'LOG_FILE': true,
          'LOG_FILE_PATH': '/custom/logs',
          'LOG_FILE_MAX_SIZE': 1000000,
          'LOG_FILE_MAX_FILES': 10,
          'LOG_CONSOLE': true,
          'LOG_AUDIT_ENABLED': true,
          'LOG_MONITORING_ENABLED': true,
          'LOG_MONITORING_ERROR_RATE_THRESHOLD': 5,
          'LOG_MONITORING_RESPONSE_TIME_THRESHOLD': 1000,
          'LOG_MONITORING_MEMORY_USAGE_THRESHOLD': 80,
        };
        return customValues[key] ?? undefined;
      });

      const logging = service.logging;
      expect(logging.base).toEqual({
        appName: 'custom-app',
        environment: 'production',
        level: 'error',
        prettyPrint: false, // because NODE_ENV is 'production'
      });
      expect(logging.file).toEqual({
        enabled: true,
        path: '/custom/logs',
        maxSize: 1000000,
        maxFiles: 10,
      });
      expect(logging.console).toEqual({
        enabled: true,
        colors: false, // because NODE_ENV is 'production'
      });
      expect(logging.audit).toBeDefined();
      expect(logging.monitoring).toEqual({
        enabled: true,
        metrics: expect.any(Object),
        alerting: {
          enabled: expect.any(Boolean),
          thresholds: {
            errorRate: 5,
            responseTime: 1000,
            memoryUsage: 80,
          },
        },
      });
    });

    it('should handle undefined values for logging configuration with development environment', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });

      const logging = service.logging;
      expect(logging.base).toEqual({
        appName: loggingConfig.base.appName,
        environment: 'development',
        level: loggingConfig.base.level,
        prettyPrint: true,
      });
      expect(logging.console).toEqual({
        enabled: loggingConfig.console.enabled,
        colors: true,
      });
    });

    it('should handle undefined values for logging configuration with production environment', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });

      const logging = service.logging;
      expect(logging.base).toEqual({
        appName: loggingConfig.base.appName,
        environment: 'production',
        level: loggingConfig.base.level,
        prettyPrint: false,
      });
      expect(logging.console).toEqual({
        enabled: loggingConfig.console.enabled,
        colors: false,
      });
    });

    it('should handle custom monitoring thresholds', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        const customValues = {
          'LOG_MONITORING_ERROR_RATE_THRESHOLD': 10,
          'LOG_MONITORING_RESPONSE_TIME_THRESHOLD': 2000,
          'LOG_MONITORING_MEMORY_USAGE_THRESHOLD': 90,
        };
        return customValues[key as keyof typeof customValues] ?? undefined;
      });

      const logging = service.logging;
      expect(logging.monitoring.alerting.thresholds).toEqual({
        errorRate: 10,
        responseTime: 2000,
        memoryUsage: 90,
      });
    });

    it('should handle null values for logging configuration', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        const nullValues: Record<LoggingConfigKeys, null> = {
          'APP_NAME': null,
          'NODE_ENV': null,
          'LOG_LEVEL': null,
          'LOG_FILE': null,
          'LOG_FILE_PATH': null,
          'LOG_FILE_MAX_SIZE': null,
          'LOG_FILE_MAX_FILES': null,
          'LOG_CONSOLE': null,
          'LOG_AUDIT_ENABLED': null,
          'LOG_MONITORING_ENABLED': null,
          'LOG_MONITORING_ERROR_RATE_THRESHOLD': null,
          'LOG_MONITORING_RESPONSE_TIME_THRESHOLD': null,
          'LOG_MONITORING_MEMORY_USAGE_THRESHOLD': null,
        };
        return nullValues[key] ?? undefined;
      });

      const logging = service.logging;
      expect(logging.base).toBeDefined();
      expect(logging.file).toBeDefined();
      expect(logging.console).toBeDefined();
      expect(logging.audit).toBeDefined();
      expect(logging.monitoring).toBeDefined();
    });

    it('should handle empty string values for logging configuration', () => {
      mockNestConfigService.get.mockImplementation((key: LoggingConfigKeys) => {
        if (key === 'APP_NAME') return '';
        if (key === 'NODE_ENV') return '';
        if (key === 'LOG_LEVEL') return '';
        if (key === 'LOG_FILE_PATH') return '';
        return undefined;
      });

      const logging = service.logging;
      expect(logging.base.appName).toBe(loggingConfig.base.appName);
      expect(logging.base.environment).toBe(loggingConfig.base.environment);
      expect(logging.base.level).toBe(loggingConfig.base.level);
      expect(logging.file.path).toBe(loggingConfig.file.path);
    });

    it('should handle all logging configuration paths', () => {
      // Test each logging configuration path individually
      const testCases = [
        { key: 'APP_NAME', value: 'test-app' },
        { key: 'NODE_ENV', value: 'test' },
        { key: 'LOG_LEVEL', value: 'debug' },
        { key: 'LOG_FILE', value: true },
        { key: 'LOG_FILE_PATH', value: '/test/logs' },
        { key: 'LOG_FILE_MAX_SIZE', value: 1000 },
        { key: 'LOG_FILE_MAX_FILES', value: 5 },
        { key: 'LOG_CONSOLE', value: true },
        { key: 'LOG_AUDIT_ENABLED', value: true },
        { key: 'LOG_MONITORING_ENABLED', value: true },
        { key: 'LOG_MONITORING_ERROR_RATE_THRESHOLD', value: 5 },
        { key: 'LOG_MONITORING_RESPONSE_TIME_THRESHOLD', value: 1000 },
        { key: 'LOG_MONITORING_MEMORY_USAGE_THRESHOLD', value: 80 },
      ];

      for (const testCase of testCases) {
        mockNestConfigService.get.mockImplementation((key: string) => {
          return key === testCase.key ? testCase.value : undefined;
        });

        const logging = service.logging;
        expect(logging).toBeDefined();
      }
    });

    it('should handle logging configuration with all values undefined', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      const logging = service.logging;
      
      // Verify each property uses its default value
      expect(logging.base.appName).toBe(loggingConfig.base.appName);
      expect(logging.base.environment).toBe(loggingConfig.base.environment);
      expect(logging.base.level).toBe(loggingConfig.base.level);
      expect(logging.base.prettyPrint).toBe(false);
      expect(logging.file.enabled).toBe(loggingConfig.file.enabled);
      expect(logging.file.path).toBe(loggingConfig.file.path);
      expect(logging.file.maxSize).toBe(loggingConfig.file.maxSize);
      expect(logging.file.maxFiles).toBe(loggingConfig.file.maxFiles);
      expect(logging.console.enabled).toBe(loggingConfig.console.enabled);
      expect(logging.console.colors).toBe(false);
      expect(logging.audit.enabled).toBe(loggingConfig.audit.enabled);
      expect(logging.monitoring.enabled).toBe(loggingConfig.monitoring.enabled);
    });

    it('should handle logging configuration with empty strings', () => {
      mockNestConfigService.get.mockImplementation((key: string) => {
        if (['APP_NAME', 'NODE_ENV', 'LOG_LEVEL', 'LOG_FILE_PATH'].includes(key)) {
          return '';
        }
        return undefined;
      });

      const logging = service.logging;
      expect(logging.base.appName).toBe(loggingConfig.base.appName);
      expect(logging.base.environment).toBe(loggingConfig.base.environment);
      expect(logging.base.level).toBe(loggingConfig.base.level);
      expect(logging.file.path).toBe(loggingConfig.file.path);
    });
  });

  describe('performance', () => {
    it('should return default performance configuration', () => {
      mockNestConfigService.get.mockImplementation((key: PerformanceConfigKeys) => {
        const defaults: Record<PerformanceConfigKeys, boolean | number> = {
          'performance.enabled': true,
          'performance.samplingRate': 1,
          'performance.maxEntries': 100,
          'performance.reportOnUnload': true,
        };
        return defaults[key] ?? undefined;
      });

      expect(service.performance).toEqual({
        enabled: true,
        samplingRate: 1,
        maxEntries: 100,
        reportOnUnload: true,
      });
    });
  });

  describe('nodeEnv', () => {
    it('should return default nodeEnv "development" when not configured', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      expect(service.nodeEnv).toBe('development');
    });

    it('should return configured nodeEnv', () => {
      mockNestConfigService.get.mockReturnValue('production');
      expect(service.nodeEnv).toBe('production');
    });
  });

  describe('npmPackageVersion', () => {
    it('should return default version "0.0.0" when not configured', () => {
      mockNestConfigService.get.mockReturnValue(undefined);
      expect(service.npmPackageVersion).toBe('0.0.0');
    });

    it('should return configured version', () => {
      mockNestConfigService.get.mockReturnValue('1.0.0');
      expect(service.npmPackageVersion).toBe('1.0.0');
    });
  });
}); 