# End-to-End Testing with Playwright

## Overview
This project uses Playwright for end-to-end testing, providing reliable and powerful browser automation capabilities. Playwright allows testing across multiple browser engines (Chromium, Firefox, and WebKit) and provides powerful features for modern web application testing.

## Recent Improvements

### 🔧 **Configuration Enhancements**
- **Conditional Cache Support**: Application now uses memory cache when Redis is disabled (default behavior)
- **Improved CI/CD Integration**: Better GitHub Actions workflow with proper browser installation and artifact handling
- **Enhanced Timeouts**: Longer timeouts for CI environments to handle slower server startup
- **Better Error Handling**: More robust server startup detection and error reporting

### 🚀 **New Local Development Script**
- **`npm run test:e2e:local`**: Automated script that handles browser installation, port cleanup, and proper environment setup
- **Port Management**: Automatically kills existing processes on port 3000
- **Browser Installation**: Ensures Playwright browsers are properly installed
- **Build Process**: Automatically builds the application before running tests

## Features
- Cross-browser testing support (Chrome, Firefox, Safari)
- Automatic waiting for elements
- Network request interception
- Mobile device emulation
- Screenshot and video capture
- Parallel test execution
- Interactive debugging
- Built-in test reporting
- **NEW**: Conditional cache configuration for different environments
- **NEW**: Improved CI/CD integration with better artifact handling

## Getting Started

### Installation
Playwright is already installed as a development dependency. The browsers are installed automatically during the setup process.

### Running Tests

#### Local Development (Recommended)
```bash
# Run tests with proper local setup (recommended for development)
npm run test:e2e:local
```

#### Standard Commands
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
Tests are located in the `tests` directory. Each test file follows the `.`.spec.ts` naming convention.

**Current Test Suite:**
- `tests/home.spec.ts` - Homepage and navigation tests
  - Homepage loading verification
  - Health check endpoint testing
  - Basic navigation element validation

Example test structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    
    const mainContent = await page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
```

## Configuration
The Playwright configuration is defined in `playwright.config.ts` and includes:

### Enhanced Configuration Features
- **Environment-Aware Settings**: Different configurations for CI vs local development
- **Improved Server Startup**: Better detection of when the application is ready
- **Conditional Cache**: Memory cache fallback when Redis is disabled
- **Extended Timeouts**: 5-minute timeout for CI environments, 2-minute for local
- **Better Reporting**: Line reporter for CI, HTML reporter for local development

### Key Configuration Options
```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 30000 : 10000,
  },
  
  webServer: {
    command: process.env.CI 
      ? 'npm run build:prod && npm run start:prod' 
      : 'npm run start:dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 300 * 1000 : 120 * 1000,
    stdout: 'Application is running on: http://localhost:3000',
    stderr: 'error',
  },
});
```

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

### 5. Environment Considerations
- **Local Development**: Use `npm run test:e2e:local` for proper setup
- **CI/CD**: Tests run automatically with proper browser installation
- **Cache Configuration**: Application automatically uses memory cache when Redis is disabled

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

### GitHub Actions Workflow
The project includes an enhanced GitHub Actions workflow (`.github/workflows/playwright.yml`) that:

1. **Proper Browser Installation**: Installs all required browsers with dependencies
2. **Application Build**: Builds the application before running tests
3. **Environment Configuration**: Sets proper CI environment variables
4. **Artifact Handling**: Uploads test results for both success and failure cases
5. **Extended Timeouts**: Uses longer timeouts for CI environments

### Workflow Features
- **Automatic Browser Installation**: `npx playwright install --with-deps`
- **Application Build**: `npm run build:frontend:dev && npm run build`
- **Test Execution**: `npx playwright test --timeout=300000 --reporter=line`
- **Artifact Upload**: Test results uploaded for debugging

## Troubleshooting

### Common Issues and Solutions

#### 1. "Process from config.webServer exited early"
**Cause**: Application failed to start due to missing dependencies or configuration issues
**Solution**: 
- Use `npm run test:e2e:local` for proper setup
- Check if Redis is running (or disable it in configuration)
- Verify all dependencies are installed

#### 2. "Executable doesn't exist" for browsers
**Cause**: Playwright browsers not installed
**Solution**: 
- Run `npx playwright install --with-deps`
- Use `npm run test:e2e:local` which handles browser installation

#### 3. "http://localhost:3000 is already used"
**Cause**: Another process is using port 3000
**Solution**: 
- Use `npm run test:e2e:local` which automatically kills existing processes
- Manually kill processes: `lsof -ti:3000 | xargs kill -9`

#### 4. Tests failing in CI but passing locally
**Cause**: Different environment configurations
**Solution**:
- Check CI environment variables
- Verify application builds correctly in CI
- Review CI logs for specific error messages

### Environment-Specific Issues

#### Local Development
```bash
# Use the local testing script for proper setup
npm run test:e2e:local

# Or manually ensure proper setup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npx playwright install --with-deps
npm run build:frontend:dev
npm run build
CI=true NODE_ENV=production npx playwright test
```

#### CI/CD Environment
- Tests run automatically with proper configuration
- Browser installation handled by GitHub Actions
- Application build included in workflow
- Extended timeouts for slower CI environments

## Additional Resources
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro) 