/**
 * Root HTTP controller — home page and site-wide static responses (robots.txt).
 *
 * Journey pages belong in feature controllers under `views/journeys/`. View
 * rendering uses Nunjucks via `@Render`; Cache-Control on HTML favours shared
 * CDN/proxy caching (`s-maxage`) while keeping browser cache short.
 */

import { Controller, Get, Render, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Handles `/` and `/robots.txt`. Registered on {@link AppModule}.
 */
@ApiTags('app')
@Controller()
export class AppController {
  /**
   * Serves `robots.txt` (PoC defaults to disallow-all).
   *
   * @remarks
   * Side effects: reads from `dist/public/robots.txt`; on missing file responds
   * with a hardcoded disallow policy. Cache-Control is 24h (public).
   *
   * @param res - Express response (bypasses Nest interceptors via `@Res`)
   */
  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    const robotsPath = join(process.cwd(), 'dist', 'public', 'robots.txt');
    try {
      const robotsContent = this.readRobotsFile(robotsPath);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(robotsContent);
    } catch {
      // Fallback if file doesn't exist
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send('User-agent: *\nDisallow: /\n');
    }
  }

  /**
   * Disk read seam for robots.txt (extractable in unit tests).
   *
   * @param robotsPath - Absolute path to robots.txt
   * @returns File contents
   * @throws Error - If the file cannot be read
   */
  readRobotsFile(robotsPath: string): string {
    return readFileSync(robotsPath, 'utf-8');
  }

  /**
   * Renders the home page (`index.njk`) via Nunjucks.
   *
   * Headers: browser `max-age=0`, shared cache `s-maxage=86400`, with
   * stale-while-revalidate for resilience. Vary Accept-Encoding for compression.
   *
   * @returns Template context
   */
  @ApiOperation({ summary: 'Get home page' })
  @ApiResponse({
    status: 200,
    description: 'Renders the home page with GOV.UK Frontend template.',
  })
  @Get()
  @Header('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600')
  @Header('Vary', 'Accept-Encoding')
  @Render('index')
  getIndex() {
    return {
      title: 'NestJS GOV.UK Frontend',
      message:
        'Welcome to the NestJS GOV.UK Frontend application, this is the homepage of the application. The FaCT journey starts below.',
    };
  }
}
