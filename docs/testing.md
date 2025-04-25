# Testing Strategy

This document outlines the testing strategy and best practices for the application.

## Overview

The application implements a comprehensive testing strategy that includes unit tests, integration tests, and end-to-end tests. The testing setup is configured to ensure high code coverage and maintainable test suites.

## Test Configuration

### Jest Configuration
The application uses Jest as the testing framework with the following configuration:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
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
  testEnvironment: 'node',
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

### Test Setup
The application includes a comprehensive test setup:

1. **Global Configuration**
   - Test timeout settings
   - Console mocking
   - Performance API mocking
   - Custom matchers

2. **Test Utilities**
   - Test application creation
   - Test module creation
   - Mock utilities
   - Environment setup/cleanup

3. **Test Hooks**
   - Global beforeAll/afterAll
   - Test-specific beforeEach/afterEach
   - Mock cleanup
   - Environment reset

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

### Development
```bash
# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run tests in debug mode
npm run test:debug
```

### CI/CD
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
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