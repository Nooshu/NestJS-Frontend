jest.mock('express-request-id', () => () => (req: any, _res: any, next: any) => {
  req.id = 'mock-id';
  next();
});

jest.mock('pino', () =>
  jest.fn((options) => {
    (global as any).__lastPinoOptions = options;
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  })
);

import express from 'express';
import pino, { type Logger } from 'pino';
import request from 'supertest';
import { applyLoggingAndMonitoring } from '../logging.middleware';
import { mockLoggingConfig } from './test.config';

describe('Logging Middleware', () => {
  let app: express.Application;
  let logs: any[];
  let capturedIntervals: Array<{ fn: (...args: any[]) => void }>;

  beforeEach(() => {
    app = express();
    logs = [];
    capturedIntervals = [];
    (global as any).__lastPinoOptions = undefined;
    (pino as unknown as jest.Mock).mockImplementation((options) => {
      (global as any).__lastPinoOptions = options;
      return {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
    });
    jest.spyOn(global, 'setInterval').mockImplementation((fn: any) => {
      capturedIntervals.push({ fn });
      return { unref: jest.fn() } as unknown as NodeJS.Timeout;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const makeLogger = (): Logger =>
    ({
      info: (arg: any) => logs.push(arg),
      warn: (arg: any) => logs.push(arg),
      error: (arg: any) => logs.push(arg),
      level: 'info',
      fatal: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      child: jest.fn(),
      isLevelEnabled: jest.fn(),
      bindings: jest.fn(),
      setBindings: jest.fn(),
      flush: jest.fn(),
    }) as unknown as Logger;

  const buildConfig = (overrides: Record<string, unknown> = {}) =>
    ({
      ...mockLoggingConfig,
      ...overrides,
      base: {
        ...mockLoggingConfig.base,
        logger: makeLogger(),
        ...((overrides.base as object) || {}),
      },
      audit: {
        ...mockLoggingConfig.audit,
        ...((overrides.audit as object) || {}),
      },
      monitoring: {
        ...mockLoggingConfig.monitoring,
        ...((overrides.monitoring as object) || {}),
        alerting: {
          ...mockLoggingConfig.monitoring.alerting,
          ...(((overrides.monitoring as any)?.alerting as object) || {}),
        },
        metrics: {
          ...mockLoggingConfig.monitoring.metrics,
          ...(((overrides.monitoring as any)?.metrics as object) || {}),
        },
      },
    }) as any;

  describe('Request and response logging', () => {
    it('should log request and response details', async () => {
      applyLoggingAndMonitoring(app, buildConfig());
      app.get('/test', (_req, res) => res.json({ ok: true }));

      await request(app).get('/test');

      expect(logs.find((l) => l.type === 'request')).toMatchObject({
        method: 'GET',
        url: '/test',
      });
      expect(logs.find((l) => l.type === 'response')).toMatchObject({ status: 200 });
    });

    it('should log error_rate and slow_response when thresholds are breached', async () => {
      applyLoggingAndMonitoring(
        app,
        buildConfig({
          monitoring: {
            enabled: true,
            metrics: mockLoggingConfig.monitoring.metrics,
            alerting: {
              enabled: true,
              thresholds: { errorRate: 5, responseTime: -1, memoryUsage: 80 },
            },
          },
        })
      );
      app.get('/error500', (_req, res) => res.status(500).json({ error: 'fail' }));

      await request(app).get('/error500');

      expect(logs.find((l) => l.type === 'error_rate')).toBeDefined();
      expect(logs.find((l) => l.type === 'slow_response')).toBeDefined();
    });

    it('should skip monitoring alerts when monitoring is disabled', async () => {
      applyLoggingAndMonitoring(
        app,
        buildConfig({
          monitoring: {
            enabled: false,
            metrics: mockLoggingConfig.monitoring.metrics,
            alerting: mockLoggingConfig.monitoring.alerting,
          },
        })
      );
      app.get('/error500', (_req, res) => res.status(500).json({ error: 'fail' }));

      await request(app).get('/error500');
      expect(logs.find((l) => l.type === 'error_rate')).toBeUndefined();
    });
  });

  describe('Error logging', () => {
    it('should log errors through the error middleware', () => {
      const handlers: any[] = [];
      const captureApp = {
        use: (handler: any) => {
          handlers.push(handler);
        },
      } as any;

      applyLoggingAndMonitoring(
        captureApp,
        buildConfig({
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
        })
      );

      const errorMiddleware = handlers.find((h) => h.length === 4);
      const next = jest.fn();
      errorMiddleware(new Error('boom'), { method: 'GET', url: '/x' }, {}, next);

      expect(logs.find((l) => l.type === 'error')).toMatchObject({ error: 'boom' });
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Audit logging', () => {
    it('should mask sensitive audit fields when enabled', () => {
      const handlers: any[] = [];
      const captureApp = {
        use: (handler: any) => {
          handlers.push(handler);
        },
      } as any;

      applyLoggingAndMonitoring(
        captureApp,
        buildConfig({
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
          audit: {
            enabled: true,
            maskSensitiveData: true,
            sensitiveFields: ['ip'],
            include: [],
            exclude: [],
          },
        })
      );

      const auditMiddleware = handlers.find((h) => h.length === 3 && handlers.indexOf(h) > 1);
      const next = jest.fn();
      auditMiddleware(
        {
          method: 'GET',
          url: '/audit',
          ip: '127.0.0.1',
          id: 'req-1',
          user: { id: 'user-1' },
          get: () => 'agent',
        },
        { statusCode: 200 },
        next
      );

      const auditLog = logs.find((l) => l.type === 'audit');
      expect(auditLog.user).toBe('user-1');
      expect(auditLog.ip).toBe('*********');
      expect(next).toHaveBeenCalled();
    });

    it('should log audit without masking when disabled', () => {
      const handlers: any[] = [];
      const captureApp = {
        use: (handler: any) => {
          handlers.push(handler);
        },
      } as any;

      applyLoggingAndMonitoring(
        captureApp,
        buildConfig({
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
          audit: {
            enabled: true,
            maskSensitiveData: false,
            sensitiveFields: ['ip'],
            include: [],
            exclude: [],
          },
        })
      );

      const auditMiddleware = handlers.find((h) => h.length === 3 && handlers.indexOf(h) > 1);
      auditMiddleware(
        {
          method: 'POST',
          url: '/audit',
          ip: '10.0.0.1',
          id: 'req-2',
          get: () => 'agent',
        },
        { statusCode: 201 },
        jest.fn()
      );

      const auditLog = logs.find((l) => l.type === 'audit');
      expect(auditLog.user).toBe('anonymous');
      expect(auditLog.ip).toBe('10.0.0.1');
    });

    it('should skip audit middleware when disabled', () => {
      const useSpy = jest.fn();
      applyLoggingAndMonitoring(
        { use: useSpy } as any,
        buildConfig({
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
        })
      );

      expect(useSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('createLogger', () => {
    it('should create a pino logger with pretty print', () => {
      applyLoggingAndMonitoring(
        { use: jest.fn() } as any,
        {
          ...mockLoggingConfig,
          base: {
            appName: 'created-app',
            environment: 'dev',
            level: 'warn',
            prettyPrint: true,
          },
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
        } as any
      );

      expect(pino).toHaveBeenCalled();
      expect((global as any).__lastPinoOptions).toMatchObject({
        name: 'created-app',
        level: 'warn',
        transport: { target: 'pino-pretty' },
      });
    });

    it('should create a pino logger without pretty print', () => {
      applyLoggingAndMonitoring(
        { use: jest.fn() } as any,
        {
          ...mockLoggingConfig,
          base: {
            appName: 'plain-app',
            environment: 'prod',
            level: 'info',
            prettyPrint: false,
          },
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: { ...mockLoggingConfig.monitoring, enabled: false },
        } as any
      );

      expect((global as any).__lastPinoOptions.transport).toBeUndefined();
    });
  });

  describe('System metrics', () => {
    it('should log system metrics and high memory usage', () => {
      applyLoggingAndMonitoring(
        { use: jest.fn() } as any,
        buildConfig({
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: {
            enabled: true,
            metrics: { http: false, system: true, business: false },
            alerting: {
              enabled: true,
              thresholds: { errorRate: 5, responseTime: 1000, memoryUsage: -1 },
            },
          },
        })
      );

      expect(capturedIntervals).toHaveLength(1);
      capturedIntervals[0].fn();

      expect(logs.find((l) => l.type === 'system_metrics')).toBeDefined();
      expect(logs.find((l) => l.type === 'high_memory_usage')).toBeDefined();
    });

    it('should skip memory alerting when alerting is disabled', () => {
      applyLoggingAndMonitoring(
        { use: jest.fn() } as any,
        buildConfig({
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: {
            enabled: true,
            metrics: { http: false, system: true, business: false },
            alerting: {
              enabled: false,
              thresholds: mockLoggingConfig.monitoring.alerting.thresholds,
            },
          },
        })
      );

      capturedIntervals[0].fn();
      expect(logs.find((l) => l.type === 'system_metrics')).toBeDefined();
      expect(logs.find((l) => l.type === 'high_memory_usage')).toBeUndefined();
    });

    it('should not warn when memory usage is below threshold', () => {
      applyLoggingAndMonitoring(
        { use: jest.fn() } as any,
        buildConfig({
          audit: { ...mockLoggingConfig.audit, enabled: false },
          monitoring: {
            enabled: true,
            metrics: { http: false, system: true, business: false },
            alerting: {
              enabled: true,
              thresholds: { errorRate: 5, responseTime: 1000, memoryUsage: 99.999 },
            },
          },
        })
      );

      capturedIntervals[0].fn();
      expect(logs.find((l) => l.type === 'system_metrics')).toBeDefined();
      expect(logs.find((l) => l.type === 'high_memory_usage')).toBeUndefined();
    });
  });
});
