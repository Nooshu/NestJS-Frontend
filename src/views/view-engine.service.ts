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
import { FingerprintService } from '../shared/services/fingerprint.service';

/**
 * Service that provides Nunjucks template rendering functionality.
 *
 * @class ViewEngineService
 * @description Handles template rendering with Nunjucks
 */
@Injectable()
export class ViewEngineService {
  private readonly env: nunjucks.Environment;

  constructor(private readonly fingerprintService: FingerprintService) {
    const config = configuration();
    const viewsPath = join(process.cwd(), 'src', 'views');
    const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');

    // Create a FileSystemLoader with the paths
    const loader = new nunjucks.FileSystemLoader([viewsPath, govukPath], {
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
    
    /**
     * Add asset fingerprinting function for templates
     * 
     * The 'assetPath' function is available in templates to resolve paths to fingerprinted assets.
     * This function calls FingerprintService.getAssetPath() to lookup the original path
     * in the asset manifest and return the fingerprinted path.
     * 
     * Example usage in templates:
     * <link href="{{ assetPath('/css/main.css') }}" rel="stylesheet">
     * <img src="{{ assetPath('/images/logo.png') }}" alt="Logo">
     * <script src="{{ assetPath('/js/app.js') }}"></script>
     * 
     * If the manifest doesn't exist or the asset isn't found, the original path is returned.
     */
    this.env.addGlobal('assetPath', (path: string) => this.fingerprintService.getAssetPath(path));
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
