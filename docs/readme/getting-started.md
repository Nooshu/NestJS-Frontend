# Getting Started

## Prerequisites

- Node.js (v20 or later)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

## Available Scripts

### Development
- `npm run start` - Start the application in standard mode
- `npm run start:dev` - Start development server with hot reload
  - Automatically compiles TypeScript on the fly
  - Watches for file changes and recompiles automatically
  - Provides hot reloading for faster development
- `npm run start:debug` - Start in debug mode with watch enabled
  - Enables Node.js debugging capabilities
  - Allows attaching debugger for step-through debugging
- `npm run start:prod` - Start production server
  - Runs the built application from dist/
  - Uses production optimisations

### Building
- `npm run build` - Build the application
  - Compiles TypeScript to JavaScript
  - Generates production-ready code in dist/

### Testing
- `npm run test` - Run all tests
  - Executes all test files using Jest
  - Shows test results and summary
- `npm run test:watch` - Run tests in watch mode
  - Continuously watches for changes
  - Re-runs tests when files are modified
- `npm run test:cov` - Run tests with coverage reporting
  - Generates detailed code coverage report
  - Shows percentage of code covered by tests
- `npm run test:debug` - Run tests in debug mode
  - Enables debugging capabilities for tests
  - Uses Node.js inspector for debugging
- `npm run test:e2e` - Run end-to-end tests
  - Executes tests from test/jest-e2e.json configuration
  - Tests the application as a whole, including API endpoints and integration points
  - Verifies complete user flows and system interactions
  - Ensures all components work together correctly
- `npm run test:govuk` - Run GOV.UK component tests
  - Tests specific to GOV.UK Frontend components
- `npm run test:govuk:watch` - Run GOV.UK tests in watch mode
  - Continuously watches for changes in GOV.UK component tests
- `npm run test:govuk:cov` - Run GOV.UK tests with coverage
  - Generates coverage report for GOV.UK component tests

### Code Quality
- `npm run format` - Format code with Prettier
  - Formats all TypeScript files in src/ and test/
  - Ensures consistent code style
- `npm run lint` - Run ESLint
  - Lints all TypeScript files
  - Automatically fixes fixable issues
  - Checks code style and potential problems 