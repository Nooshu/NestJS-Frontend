# End-to-End Testing with Playwright

## Overview
This project uses Playwright for end-to-end testing, providing reliable and powerful browser automation capabilities. Playwright allows testing across multiple browser engines (Chromium, Firefox, and WebKit) and provides powerful features for modern web application testing.

## Features
- Cross-browser testing support (Chrome, Firefox, Safari)
- Automatic waiting for elements
- Network request interception
- Mobile device emulation
- Screenshot and video capture
- Parallel test execution
- Interactive debugging
- Built-in test reporting

## Getting Started

### Installation
Playwright is already installed as a development dependency. The browsers are installed automatically during the setup process.

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in specific browsers
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Test Structure
Tests are located in the `tests` directory. Each test file follows the `.spec.ts` naming convention.

Example test structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
});
```

## Configuration
The Playwright configuration is defined in `playwright.config.ts` and includes:

- Base URL configuration for your application
- Browser configurations (Chromium, Firefox, WebKit)
- Screenshot capture on test failure
- Automatic test retries in CI environment
- Parallel test execution
- HTML test reporting

## Best Practices

### 1. Page Objects
Use the Page Object pattern to encapsulate page-specific selectors and actions:

```typescript
class HomePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
  }

  async getTitle() {
    return await this.page.title();
  }
}
```

### 2. Test Data Management
- Use test fixtures for common setup
- Clean up test data after tests
- Use unique identifiers for test data
- Avoid dependencies between tests

### 3. Selectors
- Prefer data-testid attributes for elements
- Use role-based selectors when possible
- Avoid brittle selectors like CSS classes

### 4. Waiting Strategies
- Use automatic waiting where possible
- Implement custom waiting helpers for complex scenarios
- Avoid arbitrary timeouts

## Debugging Tests

### UI Mode
Run tests with UI mode for interactive debugging:
```bash
npm run test:e2e:ui
```

### Debug Mode
Use debug mode to pause execution and inspect the browser:
```bash
npm run test:e2e:debug
```

### Screenshots and Videos
Tests automatically capture screenshots on failure. Configure additional captures in `playwright.config.ts`.

## CI/CD Integration
Playwright tests are configured to run in the CI environment with:
- Parallel execution
- Retry on failure
- HTML report generation
- Screenshot and video capture

## Common Issues and Solutions

### 1. Element Not Found
- Check if the element is in the viewport
- Verify the selector is correct
- Ensure proper waiting conditions

### 2. Timing Issues
- Use automatic waiting mechanisms
- Implement custom expect conditions
- Avoid fixed timeouts

### 3. Cross-Browser Differences
- Use browser-agnostic selectors
- Test across all supported browsers
- Document browser-specific workarounds

## Additional Resources
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices Guide](https://playwright.dev/docs/best-practices) 