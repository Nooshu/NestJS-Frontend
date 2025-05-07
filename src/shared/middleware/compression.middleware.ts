/**
 * Compression Middleware for NestJS applications.
 * Implements response compression to reduce bandwidth usage and improve performance.
 * 
 * @module CompressionMiddleware
 * @description Middleware that compresses response bodies using the compression package
 * 
 * @example
 * // Apply compression middleware to routes
 * consumer.apply(CompressionMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  /**
   * Middleware implementation that compresses response bodies
   * 
   * @param {Request} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware function
   * 
   * @remarks
   * This middleware:
   * - Uses compression level 6 (balanced between speed and compression)
   * - Only compresses responses larger than 1kb
   * - Configurable through the ConfigService
   * 
   * @returns {void}
   */
  use(req: Request, res: Response, next: NextFunction) {
    const compressionOptions = this.configService.get('performance.compression') || {
      level: 6, // Compression level (0-9, higher means better compression but slower)
      threshold: 1024, // Only compress responses larger than 1kb
    };

    return compression(compressionOptions)(req, res, next);
  }
} 