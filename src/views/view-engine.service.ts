/**
 * View engine service that provides Nunjucks template rendering functionality.
 * 
 * @module ViewEngineService
 * @requires @nestjs/common
 * @requires nunjucks
 */

import { Injectable } from '@nestjs/common';
import * as nunjucks from 'nunjucks';
import { join } from 'path';

/**
 * Service that provides Nunjucks template rendering functionality.
 * 
 * @class ViewEngineService
 * @description Handles template rendering with Nunjucks
 */
@Injectable()
export class ViewEngineService {
  private readonly env: nunjucks.Environment;

  constructor() {
    // Configure Nunjucks environment
    this.env = nunjucks.configure(join(process.cwd(), 'src', 'views'), {
      autoescape: true,
      watch: true,
      noCache: true,
    });
  }

  /**
   * Render a template with the given data.
   * 
   * @method render
   * @param {string} template - The template name
   * @param {any} data - The data to render
   * @returns {string} The rendered template
   */
  render(template: string, data: any): string {
    return this.env.render(template, data);
  }

  /**
   * Get the Nunjucks environment.
   * 
   * @method getEnv
   * @returns {nunjucks.Environment} The Nunjucks environment
   */
  getEnv(): nunjucks.Environment {
    return this.env;
  }
} 