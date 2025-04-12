/**
 * Nunjucks template engine configuration for NestJS.
 * Provides integration between NestJS and Nunjucks templating engine.
 * 
 * @module NunjucksEngine
 */

import { join } from 'path';
import * as nunjucks from 'nunjucks';

/**
 * Creates and configures a Nunjucks template engine for NestJS.
 * 
 * @function createNunjucksEngine
 * @returns {Function} A Nunjucks engine function that can be used with NestJS
 */
export function createNunjucksEngine() {
  // Configure Nunjucks environment
  const env = nunjucks.configure(join(process.cwd(), 'src', 'views'), {
    autoescape: true,
    watch: true,
    noCache: true
  });

  // Return the render function that NestJS expects
  return (filePath: string, options: any, callback: (err: Error | null, result?: string | null) => void) => {
    env.render(filePath, options, callback);
  };
} 