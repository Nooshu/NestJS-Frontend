import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LoggerService } from '../logger.service';
import type { LoggingConfiguration } from '../../shared/config/logging.config';

describe('LoggerService', () => {
  let module: TestingModule;
  let mockLogger: jest.Mocked<Logger>;
  let mockLoggingConfig: LoggingConfiguration;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    mockLoggingConfig = {
      base: {
        appName: 'test-app',
        environment: 'test',
        level: 'info',
        prettyPrint: false,
        excludePaths: [],
      },
      file: {
        enabled: false,
        path: 'logs/test.log',
        maxSize: 1024 * 1024,
        maxFiles: 5,
      },
      console: {
        enabled: true,
        colors: false,
      },
      audit: {
        enabled: true,
        include: ['timestamp', 'user', 'action', 'resource', 'status', 'ip', 'userAgent', 'requestId'],
        exclude: ['password', 'token'],
        maskSensitiveData: true,
        sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'authorization'],
      },
      monitoring: {
        enabled: true,
        metrics: {
          http: true,
          system: true,
          business: true,
        },
        alerting: {
          enabled: true,
          thresholds: {
            errorRate: 5,
            responseTime: 1000,
            memoryUsage: 80,
          },
        },
      },
    };

    module = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: 'LOGGING_CONFIG',
          useValue: mockLoggingConfig,
        },
      ],
    }).compile();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setContext', () => {
    it('should set the context and return the service instance', async () => {
      const service = await module.resolve(LoggerService);
      const result = service.setContext('TestContext');
      expect(result).toBe(service);
      expect(service['context']).toBe('TestContext');
    });
  });

  describe('error', () => {
    it('should log error with context and trace', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test error';
      const trace = 'Error stack trace';
      const meta = { userId: 123 };

      service.error(message, trace, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        context: 'TestContext',
        trace,
        userId: 123,
      });
    });

    it('should log error without optional parameters', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test error';

      service.error(message);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        context: 'TestContext',
      });
    });
  });

  describe('warn', () => {
    it('should log warning with context and metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test warning';
      const meta = { userId: 123 };

      service.warn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, {
        context: 'TestContext',
        userId: 123,
      });
    });

    it('should log warning without metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test warning';

      service.warn(message);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, {
        context: 'TestContext',
      });
    });
  });

  describe('log/info', () => {
    it('should log info message with context and metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test info';
      const meta = { userId: 123 };

      service.log(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        context: 'TestContext',
        userId: 123,
      });
    });

    it('should log info without metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test info';

      service.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        context: 'TestContext',
      });
    });
  });

  describe('debug', () => {
    it('should log debug message with context and metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test debug';
      const meta = { userId: 123 };

      service.debug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, {
        context: 'TestContext',
        userId: 123,
      });
    });

    it('should log debug without metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test debug';

      service.debug(message);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, {
        context: 'TestContext',
      });
    });
  });

  describe('verbose', () => {
    it('should log verbose message with context and metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test verbose';
      const meta = { userId: 123 };

      service.verbose(message, meta);

      expect(mockLogger.verbose).toHaveBeenCalledWith(message, {
        context: 'TestContext',
        userId: 123,
      });
    });

    it('should log verbose without metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const message = 'Test verbose';

      service.verbose(message);

      expect(mockLogger.verbose).toHaveBeenCalledWith(message, {
        context: 'TestContext',
      });
    });
  });

  describe('audit', () => {
    it('should log audit event when enabled', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const action = 'user_login';
      const data = { userId: 123, password: 'secret123' };

      service.audit(action, data);

      expect(mockLogger.info).toHaveBeenCalledWith(`AUDIT: ${action}`, {
        context: 'TestContext',
        type: 'audit',
        action,
        userId: 123,
        password: '********',
      });
    });

    it('should not log audit event when disabled', async () => {
      mockLoggingConfig.audit.enabled = false;
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const action = 'user_login';
      const data = { userId: 123 };

      service.audit(action, data);

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should not mask sensitive data when maskSensitiveData is disabled', async () => {
      mockLoggingConfig.audit.maskSensitiveData = false;
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const action = 'user_login';
      const data = { userId: 123, password: 'secret123' };

      service.audit(action, data);

      expect(mockLogger.info).toHaveBeenCalledWith(`AUDIT: ${action}`, {
        context: 'TestContext',
        type: 'audit',
        action,
        userId: 123,
        password: 'secret123',
      });
    });

    it('should mask multiple sensitive fields', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const action = 'user_login';
      const data = {
        userId: 123,
        password: 'secret123',
        token: 'jwt-token',
        apiKey: 'api-key-123',
        authorization: 'Bearer token123',
      };

      service.audit(action, data);

      expect(mockLogger.info).toHaveBeenCalledWith(`AUDIT: ${action}`, {
        context: 'TestContext',
        type: 'audit',
        action,
        userId: 123,
        password: '********',
        token: '********',
        apiKey: '********',
        authorization: '********',
      });
    });
  });

  describe('metric', () => {
    it('should log metric when monitoring is enabled', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const metric = 'response_time';
      const value = 150;
      const meta = { endpoint: '/api/users' };

      service.metric(metric, value, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(`METRIC: ${metric}`, {
        context: 'TestContext',
        type: 'metric',
        metric,
        value,
        endpoint: '/api/users',
      });
    });

    it('should not log metric when monitoring is disabled', async () => {
      mockLoggingConfig.monitoring.enabled = false;
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const metric = 'response_time';
      const value = 150;

      service.metric(metric, value);

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should log metric without metadata', async () => {
      const service = await module.resolve(LoggerService);
      service.setContext('TestContext');
      const metric = 'response_time';
      const value = 150;

      service.metric(metric, value);

      expect(mockLogger.info).toHaveBeenCalledWith(`METRIC: ${metric}`, {
        context: 'TestContext',
        type: 'metric',
        metric,
        value,
      });
    });
  });
}); 