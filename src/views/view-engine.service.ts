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
import configuration from '../shared/config/configuration';

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
    const config = configuration();
    const viewsPath = join(process.cwd(), 'src', 'views');
    const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');

    // Create a FileSystemLoader with the paths
    const loader = new nunjucks.FileSystemLoader([
      viewsPath,
      govukPath
    ], {
      noCache: config.nodeEnv !== 'production',
      watch: config.nodeEnv !== 'test',
    });

    // Create and configure the environment
    this.env = new nunjucks.Environment(loader, {
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true,
    });

    // Add any custom filters or globals here if needed
    this.env.addGlobal('asset_path', '/assets');
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