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
      filter: (req: Request, res: Response) => {
        // Skip compression if explicitly requested
        if (req.headers['x-no-compression']) {
          return false;
        }

        // Get the content type from the response or infer from the request path
        const contentType = res.getHeader('content-type') as string || '';
        const path = req.path.toLowerCase();

        // Define binary asset extensions and MIME types to exclude from compression
        const binaryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp', '.avif', '.bmp', '.tiff', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.mp4', '.mp3', '.wav', '.avi', '.mov', '.pdf', '.zip', '.gz', '.tar', '.rar', '.7z'];
        const binaryMimeTypes = [
          'image/', 'video/', 'audio/', 'application/pdf', 'application/zip', 
          'application/x-rar-compressed', 'application/x-7z-compressed',
          'font/', 'application/font-woff', 'application/font-woff2'
        ];

        // Check if the path contains binary file extensions
        const hasBinaryExtension = binaryExtensions.some(ext => path.includes(ext));
        
        // Check if the content type indicates a binary asset
        const hasBinaryMimeType = binaryMimeTypes.some(mimeType => contentType.includes(mimeType));

        // Exclude binary assets from compression
        if (hasBinaryExtension || hasBinaryMimeType) {
          return false;
        }

        return true;
      },
    };

    return compression(compressionOptions)(req, res, next);
  }
} 