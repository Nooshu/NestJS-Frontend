import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ViewEngineService } from '../views/view-engine.service';
import { GovukTestUtils } from './utils/govuk-test.utils';
import { govukTestConfig } from './govuk-components.test.config';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('GOV.UK Components', () => {
  let viewEngineService: ViewEngineService;
  let testResults: any[] = [];
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    viewEngineService = module.get<ViewEngineService>(ViewEngineService);
  });

  afterAll(async () => {
    // Create output directory if it doesn't exist
    mkdirSync(govukTestConfig.outputDir, { recursive: true });

    // Write test results to file
    writeFileSync(
      join(govukTestConfig.outputDir, 'test-results.json'),
      JSON.stringify(testResults, null, 2)
    );

    // Close the module
    await module.close();
  });

  describe('Component Tests', () => {
    govukTestConfig.components.forEach(componentName => {
      describe(componentName, () => {
        const scenarios = GovukTestUtils.getComponentScenarios(componentName);

        scenarios.forEach(scenarioName => {
          it(`should match fixture for scenario: ${scenarioName}`, () => {
            // Load the fixture
            const fixture = GovukTestUtils.loadFixture(componentName, scenarioName);

            // Get the template content directly
            const rendered = govukTestConfig.getTemplateContent(componentName, scenarioName);

            // Compare the rendered HTML with the fixture
            const passed = GovukTestUtils.compareHtml(rendered, fixture);

            // Generate and store test report
            const report = GovukTestUtils.generateTestReport(
              componentName,
              scenarioName,
              passed,
              rendered,
              fixture
            );
            testResults.push(report);

            // Assert that the test passed
            expect(passed).toBe(true);
          });
        });
      });
    });
  });
}); 