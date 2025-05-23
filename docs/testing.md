# Testing Strategy

This document outlines the testing strategy and best practices for the application.

## Overview

The application implements a comprehensive testing strategy that includes unit tests, integration tests, and end-to-end tests. The testing setup is configured to ensure high code coverage and maintainable test suites.

## Test Directory Structure

The application uses a clear separation of test types with dedicated directories:

```
├── test/                  # Jest tests (unit and integration)
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── tests/                # Playwright E2E tests
│   ├── examples/         # Example E2E tests
│   └── ...              # Other E2E test suites
└── tests-examples/       # Example tests (legacy, being migrated)
```

### Directory Purposes

1. **`test/` Directory**
   - Contains all Jest-based tests
   - Unit tests for individual components
   - Integration tests for component interactions
   - Files must end with `.spec.ts`

2. **`tests/` Directory**
   - Contains all Playwright-based E2E tests
   - End-to-end test suites
   - Example tests in `tests/examples/`
   - Files typically end with `.spec.ts`

3. **`tests-examples/` Directory**
   - Legacy directory for example tests
   - Being migrated to `tests/examples/`
   - Will be removed in future versions

### Test File Naming

- Jest tests: `*.spec.ts`
- Playwright tests: `*.spec.ts`
- Test utilities: `*.test-utils.ts`
- Test fixtures: `*.fixture.ts`

## Test Configuration

### Jest Configuration
The application uses Jest as the testing framework with the following configuration:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',           // Ignore Playwright tests
    '/e2e/',            // Ignore E2E tests
    '/tests-examples/', // Ignore legacy example tests
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.interface.ts',
    '!**/*.enum.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.config.ts',
    '!**/main.ts',
    '!**/test/**',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

### Playwright Configuration
The application uses Playwright for E2E testing with the following configuration:

```typescript
export default defineConfig({
  testDir: './tests',  // Playwright tests directory
  // ... other config ...
});
```

### Running Tests

#### Jest Tests (Unit and Integration)
```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:unit -- test/unit/path/to/test.spec.ts
```

#### Playwright Tests (E2E)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/examples/demo-todo-app.spec.ts

# Run tests in specific browser
npm run test:e2e:chromium
```

### Important Notes

1. **Test Separation**
   - Jest and Playwright tests must be kept in their respective directories
   - Jest tests should not use Playwright APIs
   - Playwright tests should not use Jest APIs

2. **File Location**
   - Place new Jest tests in `test/unit/` or `test/integration/`
   - Place new Playwright tests in `tests/`
   - Example tests should go in `tests/examples/`

3. **Configuration**
   - Jest automatically ignores Playwright test directories
   - Playwright only looks for tests in the `tests/` directory
   - Both frameworks use `.spec.ts` file extension

## Test Types

### 1. Unit Tests
Unit tests focus on testing individual components in isolation:

- **Controllers**: Test HTTP endpoints and request handling
- **Services**: Test business logic and data processing
- **Middleware**: Test request/response processing
- **Guards**: Test authentication and authorization
- **Pipes**: Test data transformation and validation
- **Filters**: Test error handling

### 2. Integration Tests
Integration tests verify component interactions:

- **Module Integration**: Test module dependencies
- **Service Integration**: Test service interactions
- **Database Integration**: Test data persistence
- **External Service Integration**: Test API calls
- **Middleware Chain**: Test request processing pipeline

### 3. End-to-End Tests
E2E tests verify the entire application flow:

- **API Endpoints**: Test complete request/response cycles
- **User Flows**: Test complete user journeys
- **Error Scenarios**: Test error handling
- **Performance**: Test response times
- **Security**: Test security measures

## Test Best Practices

### 1. Test Organization
- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and atomic
- Use test fixtures for common setup

### 2. Mocking
- Mock external dependencies
- Use jest.mock for module mocking
- Mock HTTP requests
- Mock database operations
- Mock file system operations

### 3. Assertions
- Use specific assertions
- Test edge cases
- Verify error handling
- Check side effects
- Validate state changes

### 4. Coverage
- Maintain 80% coverage threshold
- Focus on critical paths
- Test error scenarios
- Verify edge cases
- Monitor coverage trends

## Test Commands

### Unit and Integration Tests
```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run unit tests in watch mode
npm run test:unit:watch

# Run integration tests in watch mode
npm run test:integration:watch

# Run unit tests in debug mode
npm run test:unit:debug

# Run integration tests in debug mode
npm run test:integration:debug

# Run unit tests with coverage
npm run test:cov:unit

# Run integration tests with coverage
npm run test:cov:integration
```

### GOV.UK Component Tests
```bash
# Run GOV.UK component tests
npm run test:govuk

# Run GOV.UK component tests in watch mode
npm run test:govuk:watch

# Run GOV.UK component tests in debug mode
npm run test:govuk:debug

# Run GOV.UK component tests with coverage
npm run test:cov:govuk
```

### End-to-End Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in specific browsers
npm run test:e2e:chromium    # Run in Chrome
npm run test:e2e:firefox     # Run in Firefox
npm run test:e2e:webkit      # Run in Safari

# Run E2E tests in all browsers
npm run test:e2e:browsers
```

### Combined Test Commands
```bash
# Run all tests (unit, integration, GOV.UK, and E2E)
npm run test:all

# Run all tests in watch mode (concurrently)
npm run test:all:watch

# Run all tests with coverage
npm run test:cov

# Run specific test file
npm run test -- path/to/test.spec.ts
```

### Legacy Commands (Deprecated)
```bash
# These commands are maintained for backward compatibility
npm run test              # Alias for test:unit
npm run test:watch        # Alias for test:unit:watch
npm run test:debug        # Alias for test:unit:debug
npm run test:e2e:all      # Alias for test:e2e
```

## Test Documentation

### 1. Test Structure
```typescript
describe('Component', () => {
  // Setup
  beforeEach(() => {
    // Arrange
  });

  // Tests
  it('should do something', () => {
    // Act
    // Assert
  });
});
```

### 2. Test Utilities
```typescript
// Create test application
const app = await createTestApp();

// Create test module
const module = await createTestModule();

// Mock performance API with full interface implementation
global.performance = {
  ...performance,
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  now: jest.fn(),
  eventCounts: new Map() as unknown as EventCounts,
  navigation: {},
  onresourcetimingbufferfull: null,
  timing: {},
  toJSON: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as Performance;

// Mock console
global.console = mockConsole;
```

### 3. Custom Matchers
```typescript
// Range matcher
expect(value).toBeWithinRange(min, max);

// Add custom matchers
expect.extend(customMatchers);
```

## Troubleshooting

### Common Issues
1. **Test Timeouts**
   - Increase test timeout
   - Check for async operations
   - Verify cleanup

2. **Mock Issues**
   - Check mock implementation
   - Verify mock reset
   - Check mock scope

3. **Coverage Issues**
   - Review coverage report
   - Add missing tests
   - Check coverage thresholds

4. **Performance Issues**
   - Optimize test setup
   - Use test fixtures
   - Mock heavy operations

## Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://martinfowler.com/articles/practical-test-pyramid.html)

### Tools
- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Istanbul](https://istanbul.js.org/)
- [Test Coverage](https://github.com/gotwarlost/istanbul) 