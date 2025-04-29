/**
 * Tests for the GOV.UK Frontend button component.
 * Verifies that the component template matches the official fixtures.
 *
 * @module ButtonComponentTest
 */

import * as nunjucks from 'nunjucks';
import { compareHtml, loadFixtures } from './fixtures.test-helper';

/**
 * Test suite for the button component.
 *
 * @describe Button Component
 */
describe('Button Component', () => {
  /** Loaded fixtures for the button component */
  let fixtures: any;
  /** Nunjucks environment for rendering templates */
  let env: nunjucks.Environment;

  /**
   * Setup before all tests.
   * Loads fixtures and configures the Nunjucks environment.
   *
   * @beforeAll
   */
  beforeAll(() => {
    // Load the button component fixtures
    fixtures = loadFixtures('button');

    // Set up Nunjucks environment
    env = new nunjucks.Environment(new nunjucks.FileSystemLoader('src/views'), {
      autoescape: true,
      noCache: true,
    });
  });

  /**
   * Test that verifies the component matches all non-hidden fixtures.
   *
   * @test should match all non-hidden fixtures
   */
  it('should match all non-hidden fixtures', () => {
    // Filter out hidden fixtures
    const visibleFixtures = fixtures.fixtures.filter((fixture: any) => !fixture.hidden);

    visibleFixtures.forEach((fixture: any) => {
      // Render the template with the fixture options
      const rendered = env.render('components/button.njk', fixture.options);

      // Compare the rendered HTML with the expected HTML
      const matches = compareHtml(rendered, fixture.html);

      if (!matches) {
        console.log('Fixture:', fixture.name);
        console.log('Expected:', fixture.html);
        console.log('Actual:', rendered);
      }

      expect(matches).toBe(true);
    });
  });
});
