import express from 'express';
import nunjucks from 'nunjucks';
import { join } from 'path';
import { setupGovUKFrontend } from '../govuk';

describe('GOV.UK Frontend Setup', () => {
  let app: express.Application;
  let nunjucksEnv: nunjucks.Environment;

  beforeEach(() => {
    app = express();

    // Configure Nunjucks with both views and GOV.UK Frontend template directories
    const viewsPath = join(process.cwd(), 'src', 'views');
    const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');

    // Create a FileSystemLoader with both paths
    const loader = new nunjucks.FileSystemLoader([viewsPath, govukPath], {
      noCache: true,
      watch: false,
    });

    nunjucksEnv = new nunjucks.Environment(loader, {
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true,
    });
  });

  describe('setupGovUKFrontend', () => {
    it('should add GOV.UK Frontend globals to Nunjucks environment', () => {
      setupGovUKFrontend(app, nunjucksEnv);

      // Test asset path globals
      expect(nunjucksEnv.getGlobal('asset_path')).toBe('/assets');
      expect(nunjucksEnv.getGlobal('govukAssetPath')).toBe('/govuk');
      expect(nunjucksEnv.getGlobal('govukComponentsPath')).toBe(
        join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'components')
      );

      // Test component globals
      expect(typeof nunjucksEnv.getGlobal('govukButton')).toBe('function');
      expect(typeof nunjucksEnv.getGlobal('govukInput')).toBe('function');
    });

    it('should add GOV.UK Frontend date filter', () => {
      setupGovUKFrontend(app, nunjucksEnv);

      const dateFilter = nunjucksEnv.getFilter('govukDate');
      expect(typeof dateFilter).toBe('function');

      // Test date formatting
      const testDate = new Date('2024-03-20');
      const formattedDate = dateFilter(testDate);
      expect(formattedDate).toBe('20 March 2024');
    });

    it('should render GOV.UK Button component', () => {
      setupGovUKFrontend(app, nunjucksEnv);

      const buttonMacro = nunjucksEnv.getGlobal('govukButton');
      const renderedButton = buttonMacro({
        text: 'Continue',
        classes: 'govuk-button--start',
      });

      expect(renderedButton).toContain('govuk-button');
      expect(renderedButton).toContain('Continue');
      expect(renderedButton).toContain('govuk-button--start');
    });

    it('should render GOV.UK Input component', () => {
      setupGovUKFrontend(app, nunjucksEnv);

      const inputMacro = nunjucksEnv.getGlobal('govukInput');
      const renderedInput = inputMacro({
        label: {
          text: 'National Insurance number',
        },
        id: 'national-insurance-number',
        name: 'national-insurance-number',
        classes: 'govuk-input--width-10',
      });

      expect(renderedInput).toContain('govuk-input');
      expect(renderedInput).toContain('National Insurance number');
      expect(renderedInput).toContain('national-insurance-number');
      expect(renderedInput).toContain('govuk-input--width-10');
    });
  });
});
