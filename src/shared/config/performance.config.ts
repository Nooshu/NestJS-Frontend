import { CompressionOptions } from 'compression';
import { Request, Response } from 'express';
import { ServeStaticOptions } from 'serve-static';

export const performanceConfig = {
  // Compression settings
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

  // Static file serving settings
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

  // Response compression settings
  responseCompression: {
    enabled: true,
    options: {
      level: 6,
      threshold: '1kb',
    },
  },

  // Browser caching settings
  browserCache: {
    maxAge: 31536000, // 1 year in seconds
    mustRevalidate: true,
  },
};

export const apiPerformanceConfig = {
  connection: {
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 100,
    maxFreeSockets: 10,
  },
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
  cache: {
    standard: 300000, // 5 minutes
    short: 60000,    // 1 minute
    long: 3600000,   // 1 hour
  }
};