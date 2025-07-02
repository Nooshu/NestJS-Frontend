import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../logger/logger.service';

interface SanitizationConfig {
  maxBodySize: number;
  maxUrlLength: number;
  maxHeaderSize: number;
  allowedMethods: string[];
  blockedPatterns: RegExp[];
  suspiciousPatterns: RegExp[];
}

@Injectable()
export class RequestSanitizationMiddleware implements NestMiddleware {
  private readonly config: SanitizationConfig = {
    maxBodySize: 10 * 1024 * 1024, // 10MB
    maxUrlLength: 2048,
    maxHeaderSize: 8192,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    blockedPatterns: [
      // SQL Injection patterns
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(\b(script|javascript|vbscript|onload|onerror|onclick)\b)/gi,
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      // Path traversal
      /\.\.[\/\\]/g,
      // Command injection
      /[;&|`$(){}[\]]/g,
      // LDAP injection
      /[()=*!&|]/g,
    ],
    suspiciousPatterns: [
      // Suspicious user agents
      /sqlmap|nikto|nmap|masscan|nessus|openvas|w3af|skipfish|burp|owasp/gi,
      // Suspicious headers
      /x-forwarded-for.*,.*,/gi,
      // Suspicious file extensions in URLs
      /\.(php|asp|aspx|jsp|cgi|pl)$/gi,
    ],
  };

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('RequestSanitizationMiddleware');
  }

  private sanitizeString(input: string): string {
    if (!input) return input;

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Encode dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  private sanitizeObject(obj: any, depth = 0): any {
    if (depth > 10) {
      this.logger.warn('Object depth limit exceeded during sanitization');
      return {};
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
      }
      return sanitized;
    }

    return obj;
  }

  private checkBlockedPatterns(input: string): boolean {
    return this.config.blockedPatterns.some(pattern => pattern.test(input));
  }

  private checkSuspiciousPatterns(input: string): boolean {
    return this.config.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  private validateRequest(req: Request): { valid: boolean; reason?: string; suspicious?: boolean } {
    // Check HTTP method
    if (!this.config.allowedMethods.includes(req.method)) {
      return { valid: false, reason: `Method ${req.method} not allowed` };
    }

    // Check URL length
    if (req.url.length > this.config.maxUrlLength) {
      return { valid: false, reason: 'URL too long' };
    }

    // Check for blocked patterns in URL
    if (this.checkBlockedPatterns(req.url)) {
      return { valid: false, reason: 'Blocked pattern detected in URL' };
    }

    // Check for suspicious patterns in URL
    if (this.checkSuspiciousPatterns(req.url)) {
      return { valid: true, suspicious: true, reason: 'Suspicious pattern detected in URL' };
    }

    // Check headers
    const headerString = JSON.stringify(req.headers);
    if (headerString.length > this.config.maxHeaderSize) {
      return { valid: false, reason: 'Headers too large' };
    }

    if (this.checkBlockedPatterns(headerString)) {
      return { valid: false, reason: 'Blocked pattern detected in headers' };
    }

    if (this.checkSuspiciousPatterns(headerString)) {
      return { valid: true, suspicious: true, reason: 'Suspicious pattern detected in headers' };
    }

    // Check User-Agent
    const userAgent = req.headers['user-agent'] || '';
    if (this.checkSuspiciousPatterns(userAgent)) {
      return { valid: true, suspicious: true, reason: 'Suspicious user agent detected' };
    }

    // Check body if present
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length > this.config.maxBodySize) {
        return { valid: false, reason: 'Request body too large' };
      }

      if (this.checkBlockedPatterns(bodyString)) {
        return { valid: false, reason: 'Blocked pattern detected in body' };
      }

      if (this.checkSuspiciousPatterns(bodyString)) {
        return { valid: true, suspicious: true, reason: 'Suspicious pattern detected in body' };
      }
    }

    return { valid: true };
  }

  private getClientInfo(req: Request) {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const ip = forwarded?.split(',')[0] || realIp || req.ip || req.connection.remoteAddress || 'unknown';

    return {
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      referer: req.headers.referer || 'none',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const clientInfo = this.getClientInfo(req);

    // Validate request
    const validation = this.validateRequest(req);

    if (!validation.valid) {
      this.logger.error('Request blocked by sanitization middleware', undefined, {
        ...clientInfo,
        reason: validation.reason,
        blocked: true,
      });

      res.status(400).json({
        statusCode: 400,
        message: 'Bad Request',
        error: 'Request validation failed',
      });
      return;
    }

    if (validation.suspicious) {
      this.logger.warn('Suspicious request detected', {
        ...clientInfo,
        reason: validation.reason,
        suspicious: true,
      });

      // Add suspicious request header for downstream processing
      req.headers['x-suspicious-request'] = 'true';
      req.headers['x-suspicious-reason'] = validation.reason || 'unknown';
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      try {
        req.body = this.sanitizeObject(req.body);
        this.logger.debug('Request body sanitized', {
          path: req.path,
          method: req.method,
        });
      } catch (error) {
        this.logger.error('Error sanitizing request body', error instanceof Error ? error.stack : 'Unknown error', {
          ...clientInfo,
        });

        res.status(400).json({
          statusCode: 400,
          message: 'Bad Request',
          error: 'Request body sanitization failed',
        });
        return;
      }
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      try {
        req.query = this.sanitizeObject(req.query);
        this.logger.debug('Query parameters sanitized', {
          path: req.path,
          method: req.method,
        });
      } catch (error) {
        this.logger.error('Error sanitizing query parameters', error instanceof Error ? error.stack : 'Unknown error', {
          ...clientInfo,
        });

        res.status(400).json({
          statusCode: 400,
          message: 'Bad Request',
          error: 'Query parameter sanitization failed',
        });
        return;
      }
    }

    next();
  }
}
