/**
 * Tests for the GOV.UK Frontend tag component.
 * Verifies that the component template matches the official fixtures.
 *
 * @module TagComponentTest
 */

import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { verifyComponent, loadFixtures } from './fixtures.test-helper';
import type { GovukFixture } from './fixtures.test-helper';

/**
 * Test suite for the tag component.
 *
 * @describe Tag Component
 */
describe('Tag Component', () => {
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
    const govukTemplatesPath = path.join(
      process.cwd(),
      'node_modules',
      'govuk-frontend',
      'dist',
      'govuk'
    );
    const localViewsPath = path.join(process.cwd(), 'src', 'views');

    env = new nunjucks.Environment(
      [
        new nunjucks.FileSystemLoader(localViewsPath),
        new nunjucks.FileSystemLoader(govukTemplatesPath),
      ],
      {
        autoescape: true,
        noCache: true,
      }
    );

    // Add paths to the Nunjucks environment
    env.addGlobal('govukTemplatesPath', govukTemplatesPath);
    env.addGlobal('localViewsPath', localViewsPath);
  });

  /**
   * Test each fixture for the tag component.
   */
  it('should match all fixtures', () => {
    // Load fixtures
    const fixtures = loadFixtures('tag');

    // Test each fixture
    fixtures.fixtures.forEach((fixture: GovukFixture) => {
      // Skip hidden fixtures
      if (fixture.hidden) {
        return;
      }

      // Create a template that uses the tag macro
      const template = `
        {% from "components/tag/macro.njk" import govukTag %}
        {% from "macros/attributes.njk" import govukAttributes %}
        {{ govukTag(params) }}
      `;

      // Render the component with fixture options
      const rendered = env.renderString(template, { params: fixture.options });

      // Verify the rendered output matches the fixture
      verifyComponent(rendered, fixture);
    });
  });

  /**
   * Test specific tag variants to ensure they render correctly.
   */
  describe('Tag Variants', () => {
    const tagVariants = [
      { text: 'Alpha', classes: undefined, expectedClass: 'govuk-tag' },
      { text: 'Inactive', classes: 'govuk-tag--grey', expectedClass: 'govuk-tag govuk-tag--grey' },
      { text: 'New', classes: 'govuk-tag--green', expectedClass: 'govuk-tag govuk-tag--green' },
      {
        text: 'Active',
        classes: 'govuk-tag--teal',
        expectedClass: 'govuk-tag govuk-tag--teal',
      },
      {
        text: 'In progress',
        classes: 'govuk-tag--blue',
        expectedClass: 'govuk-tag govuk-tag--blue',
      },
      {
        text: 'Received',
        classes: 'govuk-tag--purple',
        expectedClass: 'govuk-tag govuk-tag--purple',
      },
      {
        text: 'Sent',
        classes: 'govuk-tag--magenta',
        expectedClass: 'govuk-tag govuk-tag--magenta',
      },
      { text: 'Rejected', classes: 'govuk-tag--red', expectedClass: 'govuk-tag govuk-tag--red' },
      {
        text: 'Declined',
        classes: 'govuk-tag--orange',
        expectedClass: 'govuk-tag govuk-tag--orange',
      },
      {
        text: 'Delayed',
        classes: 'govuk-tag--yellow',
        expectedClass: 'govuk-tag govuk-tag--yellow',
      },
    ];

    tagVariants.forEach((variant) => {
      it(`should render ${variant.text} tag with correct classes`, () => {
        const template = `
          {% from "components/tag/macro.njk" import govukTag %}
          {{ govukTag({ text: "${variant.text}", classes: "${variant.classes || ''}" }) }}
        `;

        const rendered = env.renderString(template);

        // Check that the expected class is present
        expect(rendered).toContain(variant.expectedClass);
        expect(rendered).toContain(variant.text);

        // Ensure it's wrapped in a strong tag
        expect(rendered).toMatch(/<strong[^>]*class="[^"]*govuk-tag[^"]*"[^>]*>/);
        expect(rendered).toMatch(/<\/strong>/);
      });
    });
  });

  /**
   * Test tag component with custom attributes.
   */
  it('should render tag with custom attributes', () => {
    const template = `
      {% from "components/tag/macro.njk" import govukTag %}
      {{ govukTag({
        text: "Custom Tag",
        classes: "govuk-tag--green",
        attributes: {
          "data-test": "custom-tag",
          "id": "test-tag"
        }
      }) }}
    `;

    const rendered = env.renderString(template);

    expect(rendered).toContain('data-test="custom-tag"');
    expect(rendered).toContain('id="test-tag"');
    expect(rendered).toContain('Custom Tag');
    expect(rendered).toContain('govuk-tag--green');
  });

  /**
   * Test tag component with HTML content.
   */
  it('should render tag with HTML content', () => {
    const template = `
      {% from "components/tag/macro.njk" import govukTag %}
      {{ govukTag({
        html: "<span>HTML Tag</span>",
        classes: "govuk-tag--blue"
      }) }}
    `;

    const rendered = env.renderString(template);

    expect(rendered).toContain('<span>HTML Tag</span>');
    expect(rendered).toContain('govuk-tag--blue');
  });
});
