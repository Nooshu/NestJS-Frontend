import express from 'express';
import type { Logger } from 'pino';
import request from 'supertest';
import { applyLoggingAndMonitoring } from '../logging.middleware';
import { mockLoggingConfig } from './test.config';

describe('Logging Middleware', () => {
  let app: express.Application;
  let logs: any[];

  beforeEach(() => {
    app = express();
    logs = [];

    // Mock logger
    const mockLogger: Logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
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
    } as unknown as Logger;

    // Apply logging middleware with mock logger
    applyLoggingAndMonitoring(app, {
      ...mockLoggingConfig,
      base: {
        ...mockLoggingConfig.base,
        logger: mockLogger,
      },
    });

    // Add test routes
    app.get('/test', (_req, res) => {
      res.json({ message: 'test' });
    });

    app.get('/error', (_req, _res, next) => {
      next(new Error('Test error'));
    });
  });

  describe('Request Logging', () => {
    it('should log request details', async () => {
      await request(app).get('/test');

      const requestLog = logs.find((log) => log.type === 'request');
      expect(requestLog).toBeDefined();
      expect(requestLog.method).toBe('GET');
      expect(requestLog.url).toBe('/test');
    });

    it('should log response details', async () => {
      await request(app).get('/test');

      const responseLog = logs.find((log) => log.type === 'response');
      expect(responseLog).toBeDefined();
      expect(responseLog.method).toBe('GET');
      expect(responseLog.url).toBe('/test');
      expect(responseLog.status).toBe(200);
      expect(responseLog.duration).toBeDefined();
    });
  });

  describe('Error Logging', () => {
    it('should log error details', async () => {
      await request(app).get('/error');

      const errorLog = logs.find((log) => log.type === 'error');
      expect(errorLog).toBeDefined();
      expect(errorLog.error).toBe('Test error');
      expect(errorLog.stack).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    it('should log audit events', async () => {
      await request(app).get('/test');

      const auditLog = logs.find((log) => log.type === 'audit');
      expect(auditLog).toBeDefined();
      expect(auditLog.user).toBe('anonymous');
      expect(auditLog.action).toBe('GET /test');
      expect(auditLog.status).toBe(200);
    });

    it('should mask sensitive data', async () => {
      app.post('/sensitive', (_req, res) => {
        res.json({ password: 'secret123' });
      });

      await request(app).post('/sensitive');

      const auditLog = logs.find((log) => log.type === 'audit');
      expect(auditLog.password).toBe('********');
    });
  });

  describe('Monitoring', () => {
    it('should log system metrics', async () => {
      // Wait for metrics interval
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const metricsLog = logs.find((log) => log.type === 'system_metrics');
      expect(metricsLog).toBeDefined();
      expect(metricsLog.memoryUsage).toBeDefined();
    });

    it('should log slow responses', async () => {
      app.get('/slow', (_req, res) => {
        setTimeout(() => {
          res.json({ message: 'slow' });
        }, mockLoggingConfig.monitoring.alerting.thresholds.responseTime + 100);
      });

      await request(app).get('/slow');

      const slowLog = logs.find((log) => log.type === 'slow_response');
      expect(slowLog).toBeDefined();
      expect(slowLog.duration).toBeGreaterThan(
        mockLoggingConfig.monitoring.alerting.thresholds.responseTime
      );
    });

    it('should log high error rates', async () => {
      app.get('/error500', (_req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });

      await request(app).get('/error500');

      const errorLog = logs.find((log) => log.type === 'error_rate');
      expect(errorLog).toBeDefined();
      expect(errorLog.status).toBe(500);
    });
  });
});
