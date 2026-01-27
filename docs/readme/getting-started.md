# Getting Started

## Prerequisites

- Node.js (v25.5.0 or later, LTS Krypton)
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
  - Automatically builds frontend assets optimized for development
  - Compiles TypeScript on the fly
  - Watches for file changes and recompiles automatically
  - Provides hot reloading for faster development
  - Watches and rebuilds frontend assets when they change
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
- `npm run test` - Run all unit tests
  - Executes all test files using Jest
  - Shows test results and summary
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:unit:watch` - Run unit tests in watch mode
  - Continuously watches for changes
  - Re-runs tests when files are modified
- `npm run test:integration:watch` - Run integration tests in watch mode
- `npm run test:unit:debug` - Run unit tests in debug mode
  - Enables debugging capabilities for tests
  - Uses Node.js inspector for debugging
- `npm run test:integration:debug` - Run integration tests in debug mode
- `npm run test:cov` - Run all tests with coverage reporting
  - Generates detailed code coverage report
  - Shows percentage of code covered by tests
- `npm run test:cov:unit` - Run unit tests with coverage
- `npm run test:cov:integration` - Run integration tests with coverage
- `npm run test:e2e` - Run end-to-end tests
  - Executes Playwright tests
  - Tests the application as a whole, including API endpoints and integration points
  - Verifies complete user flows and system interactions
  - Ensures all components work together correctly
- `npm run test:e2e:local` - Run end-to-end tests locally with proper setup (recommended)
  - Includes port cleanup, browser installation, and application build
  - Provides robust local testing environment
- `npm run test:e2e:ui` - Run E2E tests with UI mode
- `npm run test:e2e:debug` - Run E2E tests in debug mode
- `npm run test:e2e:chromium` - Run E2E tests in Chrome
- `npm run test:e2e:firefox` - Run E2E tests in Firefox
- `npm run test:e2e:webkit` - Run E2E tests in Safari
- `npm run test:e2e:browsers` - Run E2E tests in all browsers
- `npm run test:govuk` - Run GOV.UK component tests
  - Tests specific to GOV.UK Frontend components
- `npm run test:govuk:watch` - Run GOV.UK tests in watch mode
  - Continuously watches for changes in GOV.UK component tests
- `npm run test:govuk:debug` - Run GOV.UK tests in debug mode
- `npm run test:cov:govuk` - Run GOV.UK tests with coverage
  - Generates coverage report for GOV.UK component tests
- `npm run test:all` - Run all tests (unit, integration, GOV.UK, and E2E)
- `npm run test:all:watch` - Run all tests in watch mode (concurrently)

### Code Quality
- `npm run format` - Format code with Prettier
  - Formats all TypeScript files in src/ and test/
  - Ensures consistent code style
- `npm run lint` - Run ESLint
  - Lints all TypeScript files
  - Automatically fixes fixable issues
  - Checks code style and potential problems
- `npm run lint:check` - Check code style without fixing

### Frontend Build
- `npm run build:frontend` - Build frontend assets for production
  - Compiles SCSS to CSS
  - Copies static assets to dist/public
  - Generates fingerprinted assets for optimal caching
- `npm run build:frontend:dev` - Build frontend assets optimized for development
  - Compiles SCSS to CSS
  - Copies static assets to dist/public
  - Skips asset fingerprinting for faster builds
- `npm run build:frontend:watch` - Watch and build frontend assets
  - Continuously watches for SCSS changes
  - Automatically rebuilds on file changes
- `npm run build:scss` - Compile SCSS to CSS
  - Compiles main.scss to main.css
  - Uses compressed output style
  - Includes node_modules in load path
- `npm run build:scss:watch` - Watch and compile SCSS
  - Continuously watches for SCSS changes
  - Automatically recompiles on file changes
- `npm run copy:assets` - Copy static assets
  - Copies images from src/frontend/images to dist/public/images
  - Copies GOV.UK Frontend assets to dist/public/assets 