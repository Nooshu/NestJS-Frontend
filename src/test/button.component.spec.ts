/**
 * Tests for the GOV.UK Frontend button component.
 * Verifies that the component template matches the official fixtures.
 *
 * @module ButtonComponentTest
 */

import * as nunjucks from 'nunjucks';
import { compareHtml, loadFixtures, normalizeHtml } from './fixtures.test-helper';
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
  describe('should match all non-hidden fixtures', () => {
    // Load fixtures for this test suite
    const fixtures = loadFixtures('button');
    
    // Filter out hidden fixtures
    const visibleFixtures = fixtures.fixtures.filter((fixture: GovukFixture) => !fixture.hidden);

    // Test each fixture individually
    visibleFixtures.forEach((fixture: GovukFixture) => {
      it(`should match fixture: ${fixture.name}`, () => {
        // Log fixture details
        console.log('\nTesting fixture:', fixture.name);
        console.log('Fixture options:', JSON.stringify(fixture.options, null, 2));
        console.log('Expected HTML:', fixture.html);

        // Render the template with the fixture options
        const rendered = env.render('components/button.njk', fixture.options);
        console.log('Rendered HTML:', rendered);

        // Compare the rendered HTML with the expected HTML
        const matches = compareHtml(rendered, fixture.html);

        if (!matches) {
          const normalizedExpected = normalizeHtml(fixture.html);
          const normalizedActual = normalizeHtml(rendered);
          
          console.log('\nNormalized Expected:', normalizedExpected);
          console.log('Normalized Actual:', normalizedActual);
          
          // Find the first difference
          for (let i = 0; i < Math.max(normalizedExpected.length, normalizedActual.length); i++) {
            if (normalizedExpected[i] !== normalizedActual[i]) {
              console.log('\nFirst difference at position', i);
              console.log('Expected char:', JSON.stringify(normalizedExpected[i] || 'EOF'));
              console.log('Actual char:', JSON.stringify(normalizedActual[i] || 'EOF'));
              console.log('Context (expected):', JSON.stringify(normalizedExpected.substring(Math.max(0, i - 20), i + 20)));
              console.log('Context (actual):', JSON.stringify(normalizedActual.substring(Math.max(0, i - 20), i + 20)));
              break;
            }
          }

          // Show the full HTML for comparison
          console.log('\nFull HTML comparison:');
          console.log('Expected:', fixture.html.replace(/\n/g, '\\n'));
          console.log('Actual:', rendered.replace(/\n/g, '\\n'));
        }

        expect(matches).toBe(true);
      });
    });
  });
});
