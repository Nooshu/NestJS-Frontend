import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AssetFingerprintService } from '../services/asset-fingerprint.service';
import { performanceConfig } from '../config/performance.config';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { stat } from 'fs/promises';

@Injectable()
export class StaticAssetsMiddleware implements NestMiddleware {
  constructor(private assetFingerprintService: AssetFingerprintService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only process GET requests for static assets
    if (req.method !== 'GET') {
      return next();
    }

    // Get the original path
    const originalPath = req.path;

    // Get the hashed path
    const hashedPath = this.assetFingerprintService.getHashedPath(originalPath);

    // If the path has been hashed, redirect to the hashed version
    if (hashedPath !== originalPath) {
      res.redirect(hashedPath);
      return;
    }

    // Try to find the file in our static directories
    const staticDirs = [
      join(process.cwd(), 'src', 'public'),
      join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'),
      join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets')
    ];

    let filePath: string | null = null;
    for (const dir of staticDirs) {
      const potentialPath = join(dir, originalPath.replace(/^\/govuk\//, ''));
      if (existsSync(potentialPath)) {
        filePath = potentialPath;
        break;
      }
    }

    if (!filePath) {
      return next();
    }

    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        return next();
      }

      // Set cache headers
      const staticOptions = performanceConfig.staticAssets;
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      if (staticOptions.etag) {
        res.setHeader('ETag', `"${hashedPath}"`);
      }
      if (staticOptions.lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString());
      }

      // Set content type based on file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const contentType = {
        'css': 'text/css',
        'js': 'application/javascript',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'eot': 'application/vnd.ms-fontobject'
      }[ext || ''] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);

      // Stream the file
      createReadStream(filePath).pipe(res);
    } catch (error) {
      next(error);
    }
  }
} 