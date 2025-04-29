import type { Express } from 'express';
import nunjucks from 'nunjucks';
import { join } from 'path';

/**
 * Sets up GOV.UK Frontend for the Express.js application.
 * This function configures the GOV.UK Frontend assets and Nunjucks environment.
 *
 * @param {Express} app - The Express.js application instance
 * @param {nunjucks.Environment} nunjucksEnv - The Nunjucks environment
 */
export function setupGovUKFrontend(_app: Express, nunjucksEnv: nunjucks.Environment) {
  // Add GOV.UK Frontend globals to Nunjucks
  nunjucksEnv.addGlobal('asset_path', '/assets');
  nunjucksEnv.addGlobal('govukAssetPath', '/govuk');

  // Add GOV.UK Frontend filters
  nunjucksEnv.addFilter('govukDate', (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  // Add GOV.UK Frontend components path
  nunjucksEnv.addGlobal(
    'govukComponentsPath',
    join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'components')
  );

  // Add GOV.UK Frontend macros
  nunjucksEnv.addGlobal('govukButton', (params: any) => {
    return nunjucksEnv.render('govuk/components/button/macro.njk', params);
  });

  nunjucksEnv.addGlobal('govukInput', (params: any) => {
    return nunjucksEnv.render('govuk/components/input/macro.njk', params);
  });

  // Add more GOV.UK Frontend components as needed
}
