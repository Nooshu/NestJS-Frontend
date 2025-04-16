import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import configuration from '../config/configuration';

@Catch()
export class SecurityErrorFilter implements ExceptionFilter {
  private sanitizeError(error: unknown) {
    const isProd = configuration().nodeEnv === 'production';
    
    if (error instanceof HttpException) {
      return {
        status: error.getStatus(),
        message: error.message,
        stack: isProd ? undefined : error.stack,
      };
    }
    
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProd ? 'Internal server error' : (error as Error).message,
      stack: isProd ? undefined : (error as Error).stack,
    };
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const secureError = this.sanitizeError(exception);
    
    // Log the error securely (without sensitive data)
    console.error('Security Error:', {
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      error: secureError.message,
      status: secureError.status,
    });
    
    response
      .status(secureError.status)
      .json({
        statusCode: secureError.status,
        message: secureError.message,
        timestamp: new Date().toISOString(),
        path: request.url,
        stack: secureError.stack,
      });
  }
}
