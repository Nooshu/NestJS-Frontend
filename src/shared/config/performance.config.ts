/**
 * Performance configuration for the application.
 * Provides settings for compression, caching, and other performance optimizations.
 *
 *
 * @example
 * ```ts
 * import { performanceConfig } from './performance.config';
 * app.use(compression(performanceConfig.compression));
 * ```
 */

import { Injectable } from '@nestjs/common';
import type { CompressionOptions } from 'compression';
import type { Request, Response } from 'express';
import type { ServeStaticOptions } from 'serve-static';

@Injectable()
export class PerformanceConfig {
  constructor() {}

  get staticAssets() {
    return {
      maxAge: 31536000, // 1 year in milliseconds (365 days)
      immutable: true,
      etag: true,
      lastModified: true,
      setHeaders: (res: any) => {
        res.setHeader(
          'Cache-Control',
          'public, max-age=31536000, immutable, stale-while-revalidate=2592000'
        );
      },
    };
  }

  get compression() {
    return {
      level: 6,
      threshold: 1024,
    };
  }
}

/**
 * Main performance configuration object
 */
export const performanceConfig = {
  /**
   * Response compression settings
   */
  compression: {
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses larger than 1kb
    filter: (req: Request, res: Response) => {
      // Skip compression if explicitly requested
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Get the content type from the response or infer from the request path
      const contentType = (res.getHeader('content-type') as string) || '';
      const path = req.path.toLowerCase();

      // Define binary asset extensions and MIME types to exclude from compression
      const binaryExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.svg',
        '.ico',
        '.webp',
        '.avif',
        '.bmp',
        '.tiff',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
        '.otf',
        '.mp4',
        '.mp3',
        '.wav',
        '.avi',
        '.mov',
        '.pdf',
        '.zip',
        '.gz',
        '.tar',
        '.rar',
        '.7z',
      ];
      const binaryMimeTypes = [
        'image/',
        'video/',
        'audio/',
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'font/',
        'application/font-woff',
        'application/font-woff2',
      ];

      // Check if the path contains binary file extensions
      const hasBinaryExtension = binaryExtensions.some((ext) => path.includes(ext));

      // Check if the content type indicates a binary asset
      const hasBinaryMimeType = binaryMimeTypes.some((mimeType) => contentType.includes(mimeType));

      // Exclude binary assets from compression
      if (hasBinaryExtension || hasBinaryMimeType) {
        return false;
      }

      return true;
    },
  } as CompressionOptions,

  /**
   * Static file serving settings
   */
  staticAssets: {
    maxAge: 31536000, // 1 year in milliseconds (365 days)
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res: any) => {
      res.setHeader(
        'Cache-Control',
        'public, max-age=31536000, immutable, stale-while-revalidate=2592000'
      );
    },
  } as ServeStaticOptions,

  /**
   * Response compression settings
   */
  responseCompression: {
    enabled: true,
    options: {
      level: 6,
      threshold: '1kb',
    },
  },

  /**
   * Browser caching settings
   *
   * The stale-while-revalidate directive allows browsers to use a cached response
   * immediately while fetching a fresh copy in the background. This significantly
   * improves perceived performance while ensuring content is kept up-to-date.
   *
   * Different caching strategies are applied based on resource type:
   * - Static assets (CSS, JS, images): Very long cache with long stale-while-revalidate
   * - HTML pages: Longer cache with moderate stale-while-revalidate
   */
  browserCache: {
    maxAge: 86400, // Default cache duration: 1 day in seconds
    staticAssets: {
      maxAge: 2592000, // 30 days in seconds (increased from 7 days)
      staleWhileRevalidate: 604800, // 7 days in seconds (increased from 1 day)
    },
    pages: {
      maxAge: 86400, // 1 day in seconds (increased from 1 hour)
      staleWhileRevalidate: 3600, // 1 hour in seconds (increased from 1 minute)
    },
    mustRevalidate: true,
  },
};

/**
 * API-specific performance configuration
 */
export const apiPerformanceConfig = {
  /**
   * Connection settings
   */
  connection: {
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 100,
    maxFreeSockets: 10,
  },

  /**
   * Retry settings
   */
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  },

  /**
   * Cache settings
   */
  cache: {
    standard: 300000, // 5 minutes
    short: 60000, // 1 minute
    long: 3600000, // 1 hour
  },
};
