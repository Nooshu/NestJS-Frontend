import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import { loadFixtures, verifyComponent } from './fixtures.test-helper';
import type { GovukFixture } from './fixtures.test-helper';
import { govukTestConfig } from './govuk-components.test.config';
import { GovukTestUtils } from './utils/govuk-test.utils';

/**
 * Converts component kebab-case name to govuk macro name (e.g. 'back-link' -> 'govukBackLink')
 */
function getMacroName(componentName: string): string {
  const pascalCase = componentName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  return `govuk${pascalCase}`;
}

describe('GOV.UK Components', () => {
  const testResults: Array<{ component: string; fixture: string; passed: boolean }> = [];
  let env: nunjucks.Environment;

  beforeAll(() => {
    const govukTemplatesPath = join(
      process.cwd(),
      'node_modules',
      'govuk-frontend',
      'dist',
      'govuk'
    );
    const localViewsPath = join(process.cwd(), 'src', 'views');

    env = new nunjucks.Environment(
      [
        new nunjucks.FileSystemLoader(localViewsPath),
        new nunjucks.FileSystemLoader(govukTemplatesPath),
      ],
      { autoescape: true, noCache: true }
    );
  });

  afterAll(() => {
    mkdirSync(govukTestConfig.outputDir, { recursive: true });
    writeFileSync(
      join(govukTestConfig.outputDir, 'test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
  });

  describe('Component Fixture Tests', () => {
    govukTestConfig.components.forEach((componentName) => {
      let fixtures: { component: string; fixtures: GovukFixture[] };
      try {
        fixtures = loadFixtures(componentName);
      } catch {
        fixtures = { component: componentName, fixtures: [] };
      }

      if (fixtures.fixtures.length === 0) return;

      describe(componentName, () => {
        fixtures.fixtures.forEach((fixture: GovukFixture) => {
          if (fixture.hidden) return;

          it(`should match fixture: ${fixture.name}`, () => {
            const macroName = getMacroName(componentName);
            const template = `
              {% from "components/${componentName}/macro.njk" import ${macroName} %}
              {% from "macros/attributes.njk" import govukAttributes %}
              {{ ${macroName}(params) }}
            `;

            let rendered: string;
            try {
              rendered = env.renderString(template, { params: fixture.options });
            } catch (err) {
              throw new Error(
                `Failed to render ${componentName}/${fixture.name}: ${(err as Error).message}`
              );
            }

            try {
              verifyComponent(rendered, fixture);
              testResults.push({ component: componentName, fixture: fixture.name, passed: true });
            } catch (err) {
              testResults.push({ component: componentName, fixture: fixture.name, passed: false });
              throw err;
            }
          });
        });
      });
    });
  });
});
