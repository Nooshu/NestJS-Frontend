/**
 * Root NestJS module — composition root for DI, feature modules, and middleware order.
 *
 * Imports Core/Views/Security/Cache/Logger/Health plus journey modules. Controllers
 * listed here are app-wide (home, views, CSP reporting); journey controllers live
 * in their feature modules. Prefer registering new HTTP middleware in
 * {@link AppModule.configure} so order relative to CSRF and logging stays explicit.
 */

import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppCacheModule } from './cache/cache.module';
import { CoreModule } from './core/core.module';
import { LoggerModule } from './logger/logger.module';
import { CspReportController } from './shared/controllers/csp-report.controller';
import { OptimizedHtmlHeadersMiddleware } from './shared/middleware/optimized-html-headers.middleware';
import { CompressionMiddleware } from './shared/middleware/compression.middleware';
import { CsrfMiddleware } from './shared/middleware/csrf.middleware';
import { ErrorMiddleware } from './shared/middleware/error.middleware';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { SecurityModule } from './shared/security/security.module';
import { ViewsController } from './views/views.controller';
import { ViewsModule } from './views/views.module';
import { NewJourneyModule } from './views/journeys/new-journey/new-journey.module';
import { FindCourtTribunalModule } from './views/journeys/find-a-court-or-tribunal/find-a-court-or-tribunal.module';
import { HealthModule } from './shared/health/health.module';

/**
 * Application composition root. Instantiated by NestFactory in `main.ts`.
 *
 * @example
 * const app = await NestFactory.create(AppModule);
 */
@Module({
  imports: [
    CoreModule.forRoot(),
    ViewsModule.forRoot(),
    SecurityModule,
    AppCacheModule,
    LoggerModule,
    HealthModule,
    NewJourneyModule,
    FindCourtTribunalModule,
  ],
  controllers: [AppController, ViewsController, CspReportController],
  providers: [],
})
export class AppModule {
  /**
   * Registers Nest middleware in application order (outermost first).
   *
   * Order matters: errors/logging wrap the request, then compression and HTML
   * header optimisations, then CSRF for cookie/HTML form posts. CSRF is excluded
   * for machine-facing routes (API, health) and the find-a-court journey (API-style
   * redirects without form tokens). Do not reorder without checking TTFB headers
   * and CSRF cookie issuance on first GET.
   *
   * @param consumer - Nest middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
    consumer.apply(CompressionMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
    // Consolidates Cache-Control / Vary / encoding hints for HTML (TTFB-focused)
    consumer.apply(OptimizedHtmlHeadersMiddleware).forRoutes('*');
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'api', method: RequestMethod.ALL },
        { path: 'api/*path', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: 'find-a-court-or-tribunal', method: RequestMethod.ALL },
        { path: 'find-a-court-or-tribunal/*path', method: RequestMethod.ALL }
      )
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
