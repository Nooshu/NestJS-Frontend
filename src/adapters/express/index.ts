import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../app.module';
import { SecurityConfig } from '../../shared/config/security.config';
import { performanceConfig } from '../../shared/config/performance.config';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import nunjucks from 'nunjucks';
import { setupRoutes } from './routes';
import { setupErrorHandling } from './error-handling';
import { setupGovUKFrontend } from './govuk';
import { setupLogger } from './logger';
import { INestApplication } from '@nestjs/common';
import express from 'express';

/**
 * Creates and configures a NestJS application with Express.js adapter.
 * This adapter provides a compatibility layer for government departments using Express.js.
 * 
 * @returns {Promise<INestApplication>} Configured NestJS application
 */
export async function createExpressApp(): Promise<INestApplication> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    {
      cors: {
        origin: true,
        credentials: true,
      },
    }
  );

  const securityConfig = app.get(SecurityConfig);

  // Apply security middleware
  if (securityConfig.cors.enabled) {
    app.enableCors({
      origin: securityConfig.cors.origin,
      credentials: true,
    });
  }

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Basic Express.js configuration
  expressApp.set('view engine', 'njk');
  expressApp.set('views', join(process.cwd(), 'src', 'views'));

  // Setup Nunjucks
  const nunjucksEnv = nunjucks.configure(join(process.cwd(), 'src', 'views'), {
    autoescape: true,
    watch: process.env.NODE_ENV !== 'production',
    noCache: process.env.NODE_ENV !== 'production',
  });

  // Setup middleware
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  
  // Security middleware
  expressApp.use(helmet());
  
  // Performance middleware
  expressApp.use(compression());

  // Setup static assets
  const staticOptions = {
    maxAge: performanceConfig.staticAssets.maxAge,
    immutable: performanceConfig.staticAssets.immutable,
    etag: performanceConfig.staticAssets.etag,
    lastModified: performanceConfig.staticAssets.lastModified,
    setHeaders: performanceConfig.staticAssets.setHeaders,
  };

  expressApp.use('/public', express.static(join(process.cwd(), 'src', 'public'), staticOptions));
  expressApp.use('/govuk', express.static(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'), staticOptions));
  expressApp.use('/assets', express.static(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets'), staticOptions));

  // Setup logging
  setupLogger(expressApp);

  // Setup GOV.UK Frontend
  setupGovUKFrontend(expressApp, nunjucksEnv);

  // Setup routes
  setupRoutes(expressApp);

  // Setup error handling
  setupErrorHandling(expressApp);

  return app;
} 