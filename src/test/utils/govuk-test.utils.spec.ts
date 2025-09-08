import { readFileSync, readdirSync } from 'fs';
import { GovukTestUtils } from './govuk-test.utils';
import { govukTestConfig } from '../govuk-components.test.config';

// Mock the fs module
jest.mock('fs');
jest.mock('../govuk-components.test.config', () => ({
  govukTestConfig: {
    getFixturePath: jest.fn(),
    getScenariosPath: jest.fn(),
  },
}));

const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockReaddirSync = readdirSync as jest.MockedFunction<typeof readdirSync>;
const mockGovukTestConfig = govukTestConfig as jest.Mocked<typeof govukTestConfig>;

describe('GovukTestUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFixture', () => {
    it('should load fixture successfully', () => {
      const componentName = 'button';
      const scenarioName = 'default';
      const fixturePath = '/path/to/fixture.html';
      const fixtureContent = '<button class="govuk-button">Click me</button>';

      mockGovukTestConfig.getFixturePath.mockReturnValue(fixturePath);
      mockReadFileSync.mockReturnValue(fixtureContent);

      const result = GovukTestUtils.loadFixture(componentName, scenarioName);

      expect(mockGovukTestConfig.getFixturePath).toHaveBeenCalledWith(componentName, scenarioName);
      expect(mockReadFileSync).toHaveBeenCalledWith(fixturePath, 'utf8');
      expect(result).toBe(fixtureContent);
    });

    it('should throw error when file read fails', () => {
      const componentName = 'button';
      const scenarioName = 'default';
      const fixturePath = '/path/to/fixture.html';
      const error = new Error('ENOENT: no such file or directory');

      mockGovukTestConfig.getFixturePath.mockReturnValue(fixturePath);
      mockReadFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        GovukTestUtils.loadFixture(componentName, scenarioName);
      }).toThrow(`Failed to load fixture for ${componentName}/${scenarioName}: ${error.message}`);

      expect(mockGovukTestConfig.getFixturePath).toHaveBeenCalledWith(componentName, scenarioName);
      expect(mockReadFileSync).toHaveBeenCalledWith(fixturePath, 'utf8');
    });

    it('should handle different error types', () => {
      const componentName = 'input';
      const scenarioName = 'error';
      const fixturePath = '/path/to/fixture.html';
      const error = { message: 'Permission denied' };

      mockGovukTestConfig.getFixturePath.mockReturnValue(fixturePath);
      mockReadFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        GovukTestUtils.loadFixture(componentName, scenarioName);
      }).toThrow(`Failed to load fixture for ${componentName}/${scenarioName}: ${error.message}`);
    });
  });

  describe('getComponentScenarios', () => {
    it('should return scenario names successfully', () => {
      const componentName = 'button';
      const scenariosDir = '/path/to/scenarios';
      const files = ['template-default.html', 'template-secondary.html', 'template-start.html'];

      mockGovukTestConfig.getScenariosPath.mockReturnValue(scenariosDir);
      mockReaddirSync.mockReturnValue(files as any);

      const result = GovukTestUtils.getComponentScenarios(componentName);

      expect(mockGovukTestConfig.getScenariosPath).toHaveBeenCalledWith(componentName);
      expect(mockReaddirSync).toHaveBeenCalledWith(scenariosDir);
      expect(result).toEqual(['template-default', 'template-secondary', 'template-start']);
    });

    it('should filter out non-HTML files', () => {
      const componentName = 'input';
      const scenariosDir = '/path/to/scenarios';
      const files = ['template-default.html', 'README.md', 'template-error.html', 'config.json'];

      mockGovukTestConfig.getScenariosPath.mockReturnValue(scenariosDir);
      mockReaddirSync.mockReturnValue(files as any);

      const result = GovukTestUtils.getComponentScenarios(componentName);

      expect(result).toEqual(['template-default', 'template-error']);
    });

    it('should throw error when directory read fails', () => {
      const componentName = 'accordion';
      const scenariosDir = '/path/to/scenarios';
      const error = new Error('ENOENT: no such file or directory');

      mockGovukTestConfig.getScenariosPath.mockReturnValue(scenariosDir);
      mockReaddirSync.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        GovukTestUtils.getComponentScenarios(componentName);
      }).toThrow(`Failed to get scenarios for ${componentName}: ${error.message}`);

      expect(mockGovukTestConfig.getScenariosPath).toHaveBeenCalledWith(componentName);
      expect(mockReaddirSync).toHaveBeenCalledWith(scenariosDir);
    });

    it('should handle different error types in getComponentScenarios', () => {
      const componentName = 'table';
      const scenariosDir = '/path/to/scenarios';
      const error = { message: 'Permission denied' };

      mockGovukTestConfig.getScenariosPath.mockReturnValue(scenariosDir);
      mockReaddirSync.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        GovukTestUtils.getComponentScenarios(componentName);
      }).toThrow(`Failed to get scenarios for ${componentName}: ${error.message}`);
    });
  });

  describe('compareHtml', () => {
    it('should return true for identical HTML', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<div class="govuk-button">Click me</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should return true for HTML with different whitespace', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<div class="govuk-button">Click me</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should return true for HTML with different line endings', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<div class="govuk-button">Click me</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should return true for HTML with mixed whitespace', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<div class="govuk-button">Click me</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should return false for different HTML content', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<div class="govuk-button">Click here</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(false);
    });

    it('should return false for different HTML structure', () => {
      const html1 = '<div class="govuk-button">Click me</div>';
      const html2 = '<button class="govuk-button">Click me</button>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(false);
    });

    it('should handle empty HTML strings', () => {
      const html1 = '';
      const html2 = '';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should handle HTML with only whitespace', () => {
      const html1 = '   \n  \t  ';
      const html2 = '';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should normalize whitespace between tags', () => {
      const html1 = '<div>Hello</div> <span>World</span>';
      const html2 = '<div>Hello</div><span>World</span>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should normalize multiple spaces to single space', () => {
      const html1 = '<div>Hello    World</div>';
      const html2 = '<div>Hello World</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });
  });

  describe('generateTestReport', () => {
    it('should generate test report for passed test', () => {
      const componentName = 'button';
      const scenarioName = 'default';
      const passed = true;
      const rendered = '<button class="govuk-button">Click me</button>';
      const fixture = '<button class="govuk-button">Click me</button>';

      const result = GovukTestUtils.generateTestReport(
        componentName,
        scenarioName,
        passed,
        rendered,
        fixture
      );

      expect(result).toEqual({
        component: componentName,
        scenario: scenarioName,
        passed: true,
        timestamp: expect.any(String),
        rendered,
        fixture,
        differences: null,
      });

      // Verify timestamp is valid ISO string
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should generate test report for failed test', () => {
      const componentName = 'input';
      const scenarioName = 'error';
      const passed = false;
      const rendered = '<input class="govuk-input">';
      const fixture = '<input class="govuk-input" required>';

      const result = GovukTestUtils.generateTestReport(
        componentName,
        scenarioName,
        passed,
        rendered,
        fixture
      );

      expect(result).toEqual({
        component: componentName,
        scenario: scenarioName,
        passed: false,
        timestamp: expect.any(String),
        rendered,
        fixture,
        differences: expect.any(Array),
      });

      // Verify differences array contains the difference
      expect(result.differences).toHaveLength(1);
      expect(result.differences![0]).toEqual({
        line: 1,
        rendered: '<input class="govuk-input">',
        fixture: '<input class="govuk-input" required>',
      });
    });

    it('should handle multi-line differences', () => {
      const componentName = 'table';
      const scenarioName = 'complex';
      const passed = false;
      const rendered = 'Line 1\nLine 2\nLine 3';
      const fixture = 'Line 1\nDifferent Line 2\nLine 3';

      const result = GovukTestUtils.generateTestReport(
        componentName,
        scenarioName,
        passed,
        rendered,
        fixture
      );

      expect(result.differences).toHaveLength(1);
      expect(result.differences![0]).toEqual({
        line: 2,
        rendered: 'Line 2',
        fixture: 'Different Line 2',
      });
    });

    it('should handle different length content', () => {
      const componentName = 'accordion';
      const scenarioName = 'short';
      const passed = false;
      const rendered = 'Short content';
      const fixture = 'This is much longer content that spans multiple lines\nwith more text';

      const result = GovukTestUtils.generateTestReport(
        componentName,
        scenarioName,
        passed,
        rendered,
        fixture
      );

      expect(result.differences).toHaveLength(2);
      expect(result.differences![0]).toEqual({
        line: 1,
        rendered: 'Short content',
        fixture: 'This is much longer content that spans multiple lines',
      });
      expect(result.differences![1]).toEqual({
        line: 2,
        rendered: undefined,
        fixture: 'with more text',
      });
    });

    it('should handle empty content differences', () => {
      const componentName = 'panel';
      const scenarioName = 'empty';
      const passed = false;
      const rendered = '';
      const fixture = 'Some content';

      const result = GovukTestUtils.generateTestReport(
        componentName,
        scenarioName,
        passed,
        rendered,
        fixture
      );

      expect(result.differences).toHaveLength(1);
      expect(result.differences![0]).toEqual({
        line: 1,
        rendered: '',
        fixture: 'Some content',
      });
    });
  });

  describe('findDifferences (private method)', () => {
    // Test the private method indirectly through generateTestReport
    it('should find differences in single line content', () => {
      const rendered = 'Hello World';
      const fixture = 'Hello Universe';
      const report = GovukTestUtils.generateTestReport('test', 'test', false, rendered, fixture);

      expect(report.differences).toEqual([
        {
          line: 1,
          rendered: 'Hello World',
          fixture: 'Hello Universe',
        },
      ]);
    });

    it('should find differences in multi-line content', () => {
      const rendered = 'Line 1\nLine 2\nLine 3';
      const fixture = 'Line 1\nDifferent Line 2\nLine 3';
      const report = GovukTestUtils.generateTestReport('test', 'test', false, rendered, fixture);

      expect(report.differences).toEqual([
        {
          line: 2,
          rendered: 'Line 2',
          fixture: 'Different Line 2',
        },
      ]);
    });

    it('should find multiple differences', () => {
      const rendered = 'Line 1\nLine 2\nLine 3';
      const fixture = 'Different Line 1\nLine 2\nDifferent Line 3';
      const report = GovukTestUtils.generateTestReport('test', 'test', false, rendered, fixture);

      expect(report.differences).toEqual([
        {
          line: 1,
          rendered: 'Line 1',
          fixture: 'Different Line 1',
        },
        {
          line: 3,
          rendered: 'Line 3',
          fixture: 'Different Line 3',
        },
      ]);
    });

    it('should handle content with different line counts', () => {
      const rendered = 'Line 1\nLine 2';
      const fixture = 'Line 1\nLine 2\nLine 3\nLine 4';
      const report = GovukTestUtils.generateTestReport('test', 'test', false, rendered, fixture);

      expect(report.differences).toEqual([
        {
          line: 3,
          rendered: undefined,
          fixture: 'Line 3',
        },
        {
          line: 4,
          rendered: undefined,
          fixture: 'Line 4',
        },
      ]);
    });

    it('should handle empty lines', () => {
      const rendered = 'Line 1\n\nLine 3';
      const fixture = 'Line 1\nLine 2\nLine 3';
      const report = GovukTestUtils.generateTestReport('test', 'test', false, rendered, fixture);

      expect(report.differences).toEqual([
        {
          line: 2,
          rendered: '',
          fixture: 'Line 2',
        },
      ]);
    });

    it('should handle identical content with no differences', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const report = GovukTestUtils.generateTestReport('test', 'test', true, content, content);

      expect(report.differences).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle special characters in component and scenario names', () => {
      const componentName = 'button-with-special-chars';
      const scenarioName = 'scenario_with_underscores';
      const fixturePath = '/path/to/fixture.html';
      const fixtureContent = '<button>Test</button>';

      mockGovukTestConfig.getFixturePath.mockReturnValue(fixturePath);
      mockReadFileSync.mockReturnValue(fixtureContent);

      const result = GovukTestUtils.loadFixture(componentName, scenarioName);

      expect(mockGovukTestConfig.getFixturePath).toHaveBeenCalledWith(componentName, scenarioName);
      expect(result).toBe(fixtureContent);
    });

    it('should handle empty component and scenario names', () => {
      const componentName = '';
      const scenarioName = '';
      const fixturePath = '/path/to/fixture.html';
      const fixtureContent = '<div>Empty test</div>';

      mockGovukTestConfig.getFixturePath.mockReturnValue(fixturePath);
      mockReadFileSync.mockReturnValue(fixtureContent);

      const result = GovukTestUtils.loadFixture(componentName, scenarioName);

      expect(mockGovukTestConfig.getFixturePath).toHaveBeenCalledWith(componentName, scenarioName);
      expect(result).toBe(fixtureContent);
    });

    it('should handle very long HTML content', () => {
      const longContent = 'A'.repeat(10000);
      const html1 = `<div>${longContent}</div>`;
      const html2 = `<div>${longContent}</div>`;

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });

    it('should handle HTML with special characters', () => {
      const html1 = '<div class="test">Hello &amp; World &lt;test&gt;</div>';
      const html2 = '<div class="test">Hello &amp; World &lt;test&gt;</div>';

      const result = GovukTestUtils.compareHtml(html1, html2);

      expect(result).toBe(true);
    });
  });
});
