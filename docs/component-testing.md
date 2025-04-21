# GOV.UK Component Testing

This document outlines the component testing setup for verifying GOV.UK Frontend components against their official test fixtures.

## Overview

The component testing system:
- Tests each GOV.UK component in isolation
- Compares rendered output with official fixtures
- Generates detailed test reports
- Supports all GOV.UK Frontend components

## Test Structure

```
src/test/
├── govuk-components.test.config.ts  # Test configuration
├── govuk-components.test.ts         # Main test file
└── utils/
    └── govuk-test.utils.ts         # Test utilities
```

## Configuration

The test configuration (`govuk-components.test.config.ts`) defines:
- Components to test
- Test scenarios for each component
- Output directory for test results

```typescript
export const govukTestConfig = {
  govukFrontendPath: join(process.cwd(), 'node_modules', 'govuk-frontend'),
  components: [
    'accordion',
    'back-link',
    // ... other components
  ],
  scenarios: {
    accordion: [
      'default',
      'with-additional-descriptions',
      // ... other scenarios
    ],
  },
  outputDir: join(process.cwd(), 'test-output', 'govuk-components'),
};
```

## Test Utilities

The `GovukTestUtils` class provides:
- Loading of component fixtures
- HTML comparison
- Test report generation
- Difference detection

### Key Methods

1. **loadFixture**
   ```typescript
   static loadFixture(componentName: string, scenarioName: string): string
   ```
   - Loads the official fixture for a component scenario

2. **compareHtml**
   ```typescript
   static compareHtml(rendered: string, fixture: string): boolean
   ```
   - Compares rendered HTML with fixture
   - Normalises whitespace and line endings

3. **generateTestReport**
   ```typescript
   static generateTestReport(
     componentName: string,
     scenarioName: string,
     passed: boolean,
     rendered: string,
     fixture: string
   )
   ```
   - Generates detailed test reports
   - Includes differences if test fails

## Running Tests

1. **Run all component tests**
   ```bash
   npm test
   ```

2. **Run specific component tests**
   ```bash
   npm test -- --testPathPattern=govuk-components
   ```

3. **Generate test coverage**
   ```bash
   npm run test:cov
   ```

## Test Output

Test results are saved in `test-output/govuk-components/test-results.json`:
```json
{
  "component": "accordion",
  "scenario": "default",
  "passed": true,
  "timestamp": "2024-04-14T22:00:00.000Z",
  "rendered": "...",
  "fixture": "...",
  "differences": null
}
```

## Troubleshooting

### Common Issues

1. **Fixture Loading Errors**
   - Verify GOV.UK Frontend package is installed
   - Check component and scenario names
   - Ensure fixture files exist

2. **HTML Comparison Failures**
   - Check whitespace differences
   - Verify attribute order
   - Review HTML structure

3. **Rendering Issues**
   - Check component templates
   - Verify Nunjucks configuration
   - Review component data

### Debugging Tips

1. **View Rendered Output**
   ```typescript
   console.log(rendered);
   ```

2. **View Fixture Content**
   ```typescript
   console.log(fixture);
   ```

3. **Check Differences**
   ```typescript
   console.log(differences);
   ```

## Best Practices

1. **Component Testing**
   - Test all scenarios
   - Verify edge cases
   - Check accessibility

2. **Test Maintenance**
   - Keep fixtures up to date
   - Review test reports
   - Update component templates

3. **Performance**
   - Run tests in parallel
   - Cache fixture loading
   - Optimise HTML comparison

## References

- [GOV.UK Frontend Documentation](https://design-system.service.gov.uk/)
- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing) 
