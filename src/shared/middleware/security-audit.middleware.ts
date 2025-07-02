import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../logger/logger.service';

interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'suspicious_activity' | 'rate_limit' | 'validation_error' | 'access_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  clientInfo: {
    ip: string;
    userAgent: string;
    referer?: string | undefined;
    sessionId?: string | undefined;
    userId?: string | undefined;
  };
  requestInfo: {
    method: string;
    url: string;
    path: string;
    query: any;
    headers: Record<string, any>;
  };
  details: Record<string, any>;
}

@Injectable()
export class SecurityAuditMiddleware implements NestMiddleware {
  private readonly sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-access-token',
  ];

  private readonly sensitiveParams = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'credential',
  ];

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('SecurityAuditMiddleware');
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };

    for (const header of this.sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveParams.some(param => lowerKey.includes(param));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private getClientInfo(req: Request) {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const ip = forwarded?.split(',')[0] || realIp || req.ip || req.connection.remoteAddress || 'unknown';

    return {
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      referer: req.headers.referer,
      sessionId: req.headers['x-session-id'] as string,
      userId: req.headers['x-user-id'] as string,
    };
  }

  private getRequestInfo(req: Request) {
    return {
      method: req.method,
      url: req.url,
      path: req.path,
      query: this.sanitizeObject(req.query),
      headers: this.sanitizeHeaders(req.headers),
    };
  }

  private logSecurityEvent(event: SecurityEvent): void {
    const logLevel = this.getLogLevel(event.severity);
    const message = `Security Event: ${event.type}`;

    this.logger[logLevel](message, undefined, {
      securityEvent: event,
      timestamp: event.timestamp,
      severity: event.severity,
      type: event.type,
      clientIp: event.clientInfo.ip,
      userAgent: event.clientInfo.userAgent,
      method: event.requestInfo.method,
      path: event.requestInfo.path,
    });
  }

  private getLogLevel(severity: string): 'debug' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
      default:
        return 'info';
    }
  }

  private detectSuspiciousActivity(req: Request): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Check for suspicious patterns in URL
    const suspiciousUrlPatterns = [
      /\.\.[\/\\]/g, // Path traversal
      /[<>'"]/g, // XSS attempts
      /(union|select|insert|update|delete|drop)/gi, // SQL injection
      /\.(php|asp|aspx|jsp)$/gi, // Suspicious file extensions
    ];

    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(req.url)) {
        reasons.push(`Suspicious URL pattern: ${pattern.source}`);
      }
    }

    // Check for suspicious user agents
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousAgents = [
      /sqlmap/gi,
      /nikto/gi,
      /nmap/gi,
      /burp/gi,
      /scanner/gi,
      /bot.*crawl/gi,
    ];

    for (const pattern of suspiciousAgents) {
      if (pattern.test(userAgent)) {
        reasons.push(`Suspicious user agent: ${userAgent}`);
      }
    }

    // Check for unusual request patterns
    if (req.method === 'POST' && !req.headers['content-type']) {
      reasons.push('POST request without content-type header');
    }

    if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].toString().split(',').length > 3) {
      reasons.push('Multiple proxy forwarding detected');
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-cluster-client-ip', 'x-real-ip', 'x-forwarded-host'];
    for (const header of suspiciousHeaders) {
      if (req.headers[header] && req.headers[header] !== req.ip) {
        reasons.push(`Suspicious header: ${header}`);
      }
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  private shouldAuditRequest(req: Request): boolean {
    // Always audit authentication-related requests
    if (req.path.includes('/auth') || req.path.includes('/login') || req.path.includes('/logout')) {
      return true;
    }

    // Always audit admin requests
    if (req.path.includes('/admin')) {
      return true;
    }

    // Always audit API requests
    if (req.path.startsWith('/api')) {
      return true;
    }

    // Audit requests with suspicious headers
    if (req.headers['x-suspicious-request'] === 'true') {
      return true;
    }

    // Audit failed requests (will be determined after response)
    return false;
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const shouldAudit = this.shouldAuditRequest(req);

    if (!shouldAudit) {
      return next();
    }

    const clientInfo = this.getClientInfo(req);
    const requestInfo = this.getRequestInfo(req);

    // Check for suspicious activity
    const suspiciousActivity = this.detectSuspiciousActivity(req);

    if (suspiciousActivity.suspicious) {
      const event: SecurityEvent = {
        type: 'suspicious_activity',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        clientInfo,
        requestInfo,
        details: {
          reasons: suspiciousActivity.reasons,
          requestTime: startTime,
        },
      };

      this.logSecurityEvent(event);
    }

    // Store original end function to capture response details
    const originalEnd = res.end.bind(res);
    const self = this;

    res.end = function(this: Response, chunk?: any, encoding?: any, cb?: () => void): Response {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log security events based on response
      if (this.statusCode >= 400) {
        let eventType: SecurityEvent['type'] = 'validation_error';
        let severity: SecurityEvent['severity'] = 'low';

        if (this.statusCode === 401) {
          eventType = 'authentication';
          severity = 'medium';
        } else if (this.statusCode === 403) {
          eventType = 'authorization';
          severity = 'medium';
        } else if (this.statusCode === 429) {
          eventType = 'rate_limit';
          severity = 'high';
        } else if (this.statusCode >= 500) {
          severity = 'high';
        }

        const event: SecurityEvent = {
          type: eventType,
          severity,
          timestamp: new Date().toISOString(),
          clientInfo,
          requestInfo,
          details: {
            statusCode: this.statusCode,
            duration,
            responseHeaders: this.getHeaders(),
          },
        };

        self.logSecurityEvent(event);
      }

      // Log successful authentication events
      if (requestInfo.path.includes('/auth') && this.statusCode < 300) {
        const event: SecurityEvent = {
          type: 'authentication',
          severity: 'low',
          timestamp: new Date().toISOString(),
          clientInfo,
          requestInfo,
          details: {
            statusCode: this.statusCode,
            duration,
            success: true,
          },
        };

        self.logSecurityEvent(event);
      }

      return originalEnd(chunk, encoding, cb);
    };

    next();
  }
}
