/**
 * Nunjucks template engine configuration for NestJS.
 * Provides integration between NestJS and Nunjucks templating engine.
 * This module handles template rendering using Nunjucks as the view engine.
 *
 * @module NunjucksEngine
 * @requires path
 * @requires nunjucks
 */

import * as nunjucks from 'nunjucks';
import { join } from 'path';

/**
 * Creates and configures a Nunjucks template engine for NestJS.
 * This function sets up the Nunjucks environment with appropriate settings
 * and returns a render function compatible with NestJS's view engine interface.
 *
 * @function createNunjucksEngine
 * @returns {Function} A Nunjucks engine function that can be used with NestJS
 *
 * @example
 * // Usage in NestJS application
 * app.setViewEngine(createNunjucksEngine());
 */
export function createNunjucksEngine() {
  // Configure Nunjucks environment with specific settings
  // - autoescape: Automatically escape HTML in templates for security
  // - watch: Enable template file watching for development
  // - noCache: Disable template caching for development
  const env = nunjucks.configure(join(process.cwd(), 'src', 'views'), {
    autoescape: true,
    watch: true,
    noCache: true,
  });

  /**
   * Render function that NestJS expects from a view engine
   * This function is called by NestJS when rendering templates
   *
   * @param {string} filePath - Path to the template file
   * @param {any} options - Template rendering options and data
   * @param {Function} callback - Callback function to handle the rendering result
   * @param {Error | null} callback.err - Error object if rendering failed, null if successful
   * @param {string | null} [callback.result] - Rendered template string if successful
   */
  return (
    filePath: string,
    options: any,
    callback: (err: Error | null, result?: string | null) => void
  ) => {
    env.render(filePath, options, callback);
  };
}
