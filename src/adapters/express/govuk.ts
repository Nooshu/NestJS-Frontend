import type { Application } from 'express';
import nunjucks from 'nunjucks';
import { join } from 'path';

/**
 * Sets up GOV.UK Frontend for the Express.js application.
 * This function configures the GOV.UK Frontend assets and Nunjucks environment.
 *
 * @param {Application} app - The Express.js application instance
 * @param {nunjucks.Environment} nunjucksEnv - The Nunjucks environment
 */
export function setupGovUKFrontend(_app: Application, nunjucksEnv: nunjucks.Environment) {
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
  const componentsPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'components');
  nunjucksEnv.addGlobal('govukComponentsPath', componentsPath);

  // Add GOV.UK Frontend macros
  nunjucksEnv.addGlobal('govukButton', (params: any) => {
    const macroPath = join(componentsPath, 'button', 'macro.njk');
    const macroContent = `{% from "${macroPath}" import govukButton %}{{ govukButton(params) }}`;
    return nunjucksEnv.renderString(macroContent, { params });
  });

  nunjucksEnv.addGlobal('govukInput', (params: any) => {
    const macroPath = join(componentsPath, 'input', 'macro.njk');
    const macroContent = `{% from "${macroPath}" import govukInput %}{{ govukInput(params) }}`;
    return nunjucksEnv.renderString(macroContent, { params });
  });

  // Add more GOV.UK Frontend components as needed
}
