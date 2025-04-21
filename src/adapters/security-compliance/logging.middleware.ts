import { Application, Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { LoggingConfig } from './logging.config';
import requestId from 'express-request-id';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
      };
    }
  }
}

/**
 * Creates a logger instance
 */
function createLogger(config: LoggingConfig['base']): pino.Logger {
  return pino({
    name: config.appName,
    level: config.level,
    transport: config.prettyPrint ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: true,
      },
    } : undefined,
    base: {
      env: config.environment,
    },
  });
}

/**
 * Masks sensitive data in the log object
 */
function maskSensitiveData(obj: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const masked = { ...obj };
  
  for (const field of fields) {
    if (field in masked) {
      const value = String(masked[field]);
      masked[field] = '*'.repeat(value.length);
    }
  }
  
  return masked;
}

/**
 * Applies logging and monitoring to the Express application
 */
export function applyLoggingAndMonitoring(app: Application, config: LoggingConfig): void {
  const logger = createLogger(config.base);
  
  // Add request ID middleware
  app.use(requestId());
  
  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log request
    logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Response logging
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info({
        type: 'response',
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
      });
      
      // Check monitoring thresholds
      if (config.monitoring.enabled && config.monitoring.alerting.enabled) {
        if (res.statusCode >= 500) {
          logger.warn({
            type: 'error_rate',
            method: req.method,
            url: req.url,
            status: res.statusCode,
          });
        }
        
        if (duration > config.monitoring.alerting.thresholds.responseTime) {
          logger.warn({
            type: 'slow_response',
            method: req.method,
            url: req.url,
            duration,
          });
        }
      }
    });
    
    next();
  });
  
  // Error logging middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
      type: 'error',
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
    });
    
    next(err);
  });
  
  // Audit logging middleware
  if (config.audit.enabled) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const auditData: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        user: req.user?.id || 'anonymous',
        action: `${req.method} ${req.url}`,
        resource: req.url,
        status: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.id,
      };
      
      // Mask sensitive data if enabled
      const maskedData = config.audit.maskSensitiveData
        ? maskSensitiveData(auditData, config.audit.sensitiveFields)
        : auditData;
      
      logger.info({
        type: 'audit',
        ...maskedData,
      });
      
      next();
    });
  }
  
  // System metrics middleware
  if (config.monitoring.enabled && config.monitoring.metrics.system) {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      
      logger.info({
        type: 'system_metrics',
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
      });
      
      // Check memory threshold
      if (config.monitoring.alerting.enabled) {
        const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        if (memoryPercentage > config.monitoring.alerting.thresholds.memoryUsage) {
          logger.warn({
            type: 'high_memory_usage',
            percentage: memoryPercentage,
          });
        }
      }
    }, 60000); // Every minute
  }
} 