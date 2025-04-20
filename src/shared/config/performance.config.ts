/**
 * Performance configuration for the application.
 * Provides settings for compression, caching, and other performance optimizations.
 * 
 * @module PerformanceConfig
 * @description Application performance configuration
 * 
 * @example
 * // Import and use performance configuration
 * import { performanceConfig } from './performance.config';
 * 
 * // Apply compression middleware
 * app.use(compression(performanceConfig.compression));
 */

import { CompressionOptions } from 'compression';
import { Request, Response } from 'express';
import { ServeStaticOptions } from 'serve-static';

/**
 * Main performance configuration object
 * 
 * @type {Object}
 * @property {CompressionOptions} compression - Response compression settings
 * @property {ServeStaticOptions} staticAssets - Static file serving settings
 * @property {Object} responseCompression - Response compression settings
 * @property {Object} browserCache - Browser caching settings
 */
export const performanceConfig = {
  /**
   * Response compression settings
   * @type {CompressionOptions}
   */
  compression: {
    level: 6, // Compression level (0-9)
    threshold: '1kb', // Only compress responses larger than 1kb
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return true;
    },
  } as CompressionOptions,

  /**
   * Static file serving settings
   * @type {ServeStaticOptions}
   */
  staticAssets: {
    maxAge: '1y', // Cache static assets for 1 year
    immutable: true, // Mark static assets as immutable
    etag: true, // Enable ETag generation
    lastModified: true, // Enable Last-Modified header
    setHeaders: (res: Response, path: string) => {
      // Add Cache-Control header for static assets
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  } as ServeStaticOptions,

  /**
   * Response compression settings
   * @type {Object}
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
   * @type {Object}
   */
  browserCache: {
    maxAge: 31536000, // 1 year in seconds
    mustRevalidate: true,
  },
};

/**
 * API-specific performance configuration
 * 
 * @type {Object}
 * @property {Object} connection - Connection settings
 * @property {Object} retry - Retry settings
 * @property {Object} cache - Cache settings
 */
export const apiPerformanceConfig = {
  /**
   * Connection settings
   * @type {Object}
   */
  connection: {
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 100,
    maxFreeSockets: 10,
  },

  /**
   * Retry settings
   * @type {Object}
   */
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  },

  /**
   * Cache settings
   * @type {Object}
   */
  cache: {
    standard: 300000, // 5 minutes
    short: 60000,    // 1 minute
    long: 3600000,   // 1 hour
  }
};