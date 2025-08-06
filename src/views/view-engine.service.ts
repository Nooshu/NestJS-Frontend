/**
 * View Engine Service Module
 *
 * This service provides comprehensive Nunjucks template rendering functionality for the NestJS application.
 * It integrates with GOV.UK Frontend components and provides asset fingerprinting support for optimal
 * browser caching and performance.
 *
 * Key Features:
 * - Nunjucks template engine configuration and management
 * - GOV.UK Frontend component integration
 * - Asset fingerprinting support for cache busting
 * - Environment-aware template caching and watching
 * - Custom global functions and filters for templates
 * - Secure template rendering with auto-escaping
 *
 * @module ViewEngineService
 * @requires @nestjs/common
 * @requires nunjucks
 * @requires path
 *
 * @example
 * ```typescript
 * // Inject the service in a controller
 * constructor(private readonly viewEngine: ViewEngineService) {}
 *
 * // Render a template
 * const html = this.viewEngine.render('template.njk', { title: 'Page Title' });
 * ```
 */

import { Injectable } from '@nestjs/common';
import * as nunjucks from 'nunjucks';
import { join } from 'path';
import configuration from '../shared/config/configuration';
import { FingerprintService } from '../shared/services/fingerprint.service';

/**
 * Service that provides Nunjucks template rendering functionality with GOV.UK Frontend integration.
 *
 * This service configures and manages the Nunjucks template engine, providing a bridge between
 * NestJS controllers and the template rendering system. It includes support for:
 * - GOV.UK Frontend component templates
 * - Asset fingerprinting for optimal caching
 * - Environment-specific configuration (development vs production)
 * - Custom template globals and filters
 * - Secure template rendering with auto-escaping
 *
 * The service is configured to load templates from multiple locations:
 * 1. Application templates (src/views)
 * 2. GOV.UK Frontend component templates (node_modules/govuk-frontend/dist)
 *
 * @class ViewEngineService
 * @description Handles template rendering with Nunjucks and GOV.UK Frontend integration
 *
 * @example
 * ```typescript
 * // Basic usage in a controller
 * @Get()
 * @Render('index')
 * getIndex() {
 *   return { title: 'Home Page' };
 * }
 *
 * // Manual rendering
 * const html = this.viewEngine.render('template.njk', {
 *   title: 'Page Title',
 *   data: someData
 * });
 * ```
 */
@Injectable()
export class ViewEngineService {
  /** The configured Nunjucks environment instance */
  private readonly env: nunjucks.Environment;

  /**
   * Creates and configures the ViewEngineService with Nunjucks environment.
   *
   * This constructor sets up the Nunjucks template engine with:
   * - Multiple template loading paths (app templates + GOV.UK Frontend)
   * - Environment-specific caching and watching configuration
   * - Security settings (auto-escaping, error handling)
   * - Custom global functions for asset management
   *
   * @param {FingerprintService} fingerprintService - Service for resolving fingerprinted asset paths
   *
   * @example
   * ```typescript
   * // The service is automatically instantiated by NestJS dependency injection
   * // and configured based on the current environment settings
   * ```
   */
  constructor(private readonly fingerprintService: FingerprintService) {
    const config = configuration();

    // Define template loading paths
    // Primary path: Application-specific templates
    const viewsPath = join(process.cwd(), 'dist', 'views');
    // Secondary path: GOV.UK Frontend component templates
    const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');

    /**
     * FileSystemLoader Configuration
     *
     * The loader is configured with multiple paths to support:
     * 1. Application templates (src/views) - Custom application templates
     * 2. GOV.UK Frontend templates - Official government design system components
     *
     * Configuration options:
     * - noCache: Disables template caching in non-production environments for development
     * - watch: Enables file watching in non-test environments for auto-reloading
     */
    const loader = new nunjucks.FileSystemLoader([viewsPath, govukPath], {
      noCache: config.nodeEnv !== 'production', // Enable caching in production only
      watch: config.nodeEnv !== 'test', // Enable file watching except during testing
    });

    /**
     * Nunjucks Environment Configuration
     *
     * Security and rendering options:
     * - autoescape: true - Automatically escapes variables to prevent XSS attacks
     * - throwOnUndefined: false - Allows undefined variables (renders as empty string)
     * - trimBlocks: true - Removes trailing newlines from blocks
     * - lstripBlocks: true - Removes leading whitespace from blocks
     */
    this.env = new nunjucks.Environment(loader, {
      autoescape: true, // Critical for security - prevents XSS attacks
      throwOnUndefined: false, // Graceful handling of undefined variables
      trimBlocks: true, // Clean HTML output by removing unnecessary whitespace
      lstripBlocks: true, // Clean HTML output by removing leading whitespace
    });

    /**
     * Legacy Asset Path Global
     *
     * Provides a basic asset path for backward compatibility.
     * This is superseded by the assetPath function below.
     */
    this.env.addGlobal('asset_path', '/assets');

    /**
     * Asset Fingerprinting Global Function
     *
     * The 'assetPath' function is available in all templates to resolve paths to fingerprinted assets.
     * This function integrates with the FingerprintService to provide cache-busting functionality
     * by appending content hashes to asset filenames.
     *
     * How it works:
     * 1. Takes an original asset path (e.g., '/css/main.css')
     * 2. Looks up the fingerprinted version in the asset manifest
     * 3. Returns the fingerprinted path (e.g., '/css/main.a1b2c3d4.css')
     * 4. Falls back to the original path if fingerprinting is not available
     *
     * Benefits:
     * - Enables long-term browser caching (1 year) with immutable flag
     * - Automatic cache invalidation when assets change
     * - No manual cache busting required
     * - Improved page load performance for returning visitors
     *
     * @param {string} path - The original asset path
     * @returns {string} The fingerprinted asset path or original path as fallback
     *
     * @example
     * ```nunjucks
     * <!-- In templates, use assetPath for all static assets -->
     * <link href="{{ assetPath('/css/main.css') }}" rel="stylesheet">
     * <img src="{{ assetPath('/images/logo.png') }}" alt="Logo">
     * <script src="{{ assetPath('/js/app.js') }}"></script>
     *
     * <!-- The function automatically resolves to fingerprinted versions: -->
     * <!-- <link href="/css/main.a1b2c3d4.css" rel="stylesheet"> -->
     * <!-- <img src="/images/logo.e5f6g7h8.png" alt="Logo"> -->
     * <!-- <script src="/js/app.i9j0k1l2.js"></script> -->
     * ```
     */
    this.env.addGlobal('assetPath', (path: string) => this.fingerprintService.getAssetPath(path));
  }

  /**
   * Renders a Nunjucks template with the provided data.
   *
   * This method processes the specified template file and renders it with the given data context.
   * It handles template inheritance, includes, macros, and all other Nunjucks features.
   *
   * The rendering process:
   * 1. Locates the template file in the configured paths
   * 2. Processes template inheritance and includes
   * 3. Applies the data context to template variables
   * 4. Executes any template logic (loops, conditionals, etc.)
   * 5. Returns the final HTML string
   *
   * @param {string} template - The template filename (relative to template paths)
   * @param {any} data - The data context to pass to the template
   * @returns {string} The rendered HTML string
   * @throws {Error} If the template file is not found or contains syntax errors
   *
   * @example
   * ```typescript
   * // Render a simple template
   * const html = this.viewEngine.render('page.njk', {
   *   title: 'Welcome',
   *   user: { name: 'John Doe' }
   * });
   *
   * // Render with complex data
   * const html = this.viewEngine.render('dashboard.njk', {
   *   title: 'Dashboard',
   *   user: currentUser,
   *   stats: await this.getStatistics(),
   *   notifications: await this.getNotifications()
   * });
   * ```
   */
  render(template: string, data: any): string {
    return this.env.render(template, data);
  }

  /**
   * Provides access to the underlying Nunjucks environment.
   *
   * This method exposes the configured Nunjucks environment for advanced use cases
   * such as adding custom filters, globals, or extensions. It should be used sparingly
   * and only when the standard rendering functionality is insufficient.
   *
   * Common use cases:
   * - Adding custom template filters
   * - Registering template extensions
   * - Accessing advanced Nunjucks features
   * - Testing template functionality
   *
   * @returns {nunjucks.Environment} The configured Nunjucks environment instance
   *
   * @example
   * ```typescript
   * // Add a custom filter
   * const env = this.viewEngine.getEnv();
   * env.addFilter('currency', (value) => {
   *   return new Intl.NumberFormat('en-GB', {
   *     style: 'currency',
   *     currency: 'GBP'
   *   }).format(value);
   * });
   *
   * // Add a custom global function
   * env.addGlobal('formatDate', (date) => {
   *   return new Date(date).toLocaleDateString('en-GB');
   * });
   * ```
   */
  getEnv(): nunjucks.Environment {
    return this.env;
  }
}
