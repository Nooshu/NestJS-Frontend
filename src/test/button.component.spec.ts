/**
 * Tests for the GOV.UK Frontend button component.
 * Verifies that the component template matches the official fixtures.
 *
 * @module ButtonComponentTest
 */

import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { parse, HTMLElement } from 'node-html-parser';
import { verifyComponent, loadFixtures } from './fixtures.test-helper';
import type { GovukFixture } from './fixtures.test-helper';

/**
 * Test suite for the button component.
 *
 * @describe Button Component
 */
describe('Button Component', () => {
  /** Nunjucks environment for rendering templates */
  let env: nunjucks.Environment;

  /**
   * Setup before all tests.
   * Configures the Nunjucks environment.
   *
   * @beforeAll
   */
  beforeAll(() => {
    // Set up Nunjucks environment with paths to both local views and govuk-frontend templates
    const govukTemplatesPath = path.join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk');
    const localViewsPath = path.join(process.cwd(), 'src', 'views');
    
    env = new nunjucks.Environment([
      new nunjucks.FileSystemLoader(localViewsPath),
      new nunjucks.FileSystemLoader(govukTemplatesPath)
    ], {
      autoescape: true,
      noCache: true,
    });

    // Add paths to the Nunjucks environment
    env.addGlobal('govukTemplatesPath', govukTemplatesPath);
    env.addGlobal('localViewsPath', localViewsPath);
  });

  /**
   * Test each fixture for the button component.
   */
  it('should match all fixtures', () => {
    // Load fixtures
    const fixtures = loadFixtures('button');

    // Test each fixture
    fixtures.fixtures.forEach((fixture: GovukFixture) => {
      // Skip hidden fixtures
      if (fixture.hidden) {
        return;
      }

      // Create a template that uses the button macro
      const template = `
        {% from "components/button/macro.njk" import govukButton %}
        {% from "macros/attributes.njk" import govukAttributes %}
        {{ govukButton(params) }}
      `;

      // Render the component with fixture options
      const rendered = env.renderString(template, { params: fixture.options });

      // Verify the rendered output matches the fixture
      verifyComponent(rendered, fixture);
    });
  });
});
