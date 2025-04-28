import { readFileSync, readdirSync } from 'fs';
import { govukTestConfig } from '../govuk-components.test.config';

export class GovukTestUtils {
  /**
   * Load a component's test fixture
   * @param componentName Name of the component
   * @param scenarioName Name of the scenario
   * @returns The fixture HTML content
   */
  static loadFixture(componentName: string, scenarioName: string): string {
    const fixturePath = govukTestConfig.getFixturePath(componentName, scenarioName);

    try {
      return readFileSync(fixturePath, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to load fixture for ${componentName}/${scenarioName}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get all available scenarios for a component
   * @param componentName Name of the component
   * @returns Array of scenario names
   */
  static getComponentScenarios(componentName: string): string[] {
    const fixturesDir = govukTestConfig.getScenariosPath(componentName);

    try {
      const files = readdirSync(fixturesDir);
      return files
        .filter((file) => file.endsWith('.html'))
        .map((file) => file.replace('.html', ''));
    } catch (error) {
      throw new Error(`Failed to get scenarios for ${componentName}: ${(error as Error).message}`);
    }
  }

  /**
   * Compare rendered HTML with fixture
   * @param rendered HTML rendered by the application
   * @param fixture HTML from the fixture
   * @returns true if they match, false otherwise
   */
  static compareHtml(rendered: string, fixture: string): boolean {
    // Normalize whitespace and line endings
    const normalize = (html: string) => {
      return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    };

    const normalizedRendered = normalize(rendered);
    const normalizedFixture = normalize(fixture);

    return normalizedRendered === normalizedFixture;
  }

  /**
   * Generate a test report
   * @param componentName Name of the component
   * @param scenarioName Name of the scenario
   * @param passed Whether the test passed
   * @param rendered The rendered HTML
   * @param fixture The fixture HTML
   * @returns Test report object
   */
  static generateTestReport(
    componentName: string,
    scenarioName: string,
    passed: boolean,
    rendered: string,
    fixture: string
  ) {
    return {
      component: componentName,
      scenario: scenarioName,
      passed,
      timestamp: new Date().toISOString(),
      rendered,
      fixture,
      differences: passed ? null : this.findDifferences(rendered, fixture),
    };
  }

  /**
   * Find differences between rendered and fixture HTML
   * @param rendered The rendered HTML
   * @param fixture The fixture HTML
   * @returns Object containing differences
   */
  private static findDifferences(rendered: string, fixture: string) {
    const renderedLines = rendered.split('\n');
    const fixtureLines = fixture.split('\n');
    const differences = [];

    for (let i = 0; i < Math.max(renderedLines.length, fixtureLines.length); i++) {
      if (renderedLines[i] !== fixtureLines[i]) {
        differences.push({
          line: i + 1,
          rendered: renderedLines[i],
          fixture: fixtureLines[i],
        });
      }
    }

    return differences;
  }
}
