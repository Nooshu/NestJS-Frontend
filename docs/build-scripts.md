# Build Scripts Documentation

This document provides detailed information about all the build scripts available in the project.

## Application Build Scripts

### Backend (NestJS)
```bash
npm run build                 # Compile the NestJS application
npm run start                 # Start the compiled application
npm run start:dev            # Start with auto-reload for development
npm run start:debug          # Start in debug mode
npm run start:prod           # Run production build
```

### Frontend Assets
```bash
npm run build:frontend       # Build all frontend assets (SCSS, copy assets, fingerprint)
npm run build:frontend:dev   # Build frontend assets optimized for development (skips fingerprinting)
npm run build:frontend:watch # Watch and rebuild frontend assets
npm run build:scss          # Compile SCSS to CSS
npm run build:scss:watch    # Watch and compile SCSS
npm run copy:assets         # Copy all static assets to output directory
npm run copy:images         # Copy images from src/frontend/images to dist/public/images
npm run copy:govuk-assets   # Copy GOV.UK Frontend assets to dist/public/assets
npm run copy:govuk-dist     # Copy GOV.UK Frontend dist files to dist/public/govuk
npm run copy:public-assets  # Copy all assets from src/public to dist/public
npm run fingerprint:assets  # Generate fingerprinted assets
```

## Testing Scripts

### Unit and Integration Tests (Jest)
```bash
npm run test                # Run all unit tests
npm run test:unit           # Run unit tests
npm run test:integration    # Run integration tests
npm run test:unit:watch     # Run unit tests in watch mode
npm run test:integration:watch # Run integration tests in watch mode
npm run test:unit:debug     # Run unit tests in debug mode
npm run test:integration:debug # Run integration tests in debug mode
npm run test:cov            # Run all tests with coverage
npm run test:cov:unit       # Run unit tests with coverage
npm run test:cov:integration # Run integration tests with coverage
```

### End-to-End Tests (Playwright)
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:local      # Run E2E tests locally with proper setup (recommended)
npm run test:e2e:ui         # Run E2E tests with UI mode for interactive debugging
npm run test:e2e:debug      # Run E2E tests in debug mode with browser inspector
npm run test:e2e:chromium   # Run E2E tests specifically in Chrome
npm run test:e2e:firefox    # Run E2E tests specifically in Firefox
npm run test:e2e:webkit     # Run E2E tests specifically in Safari
npm run test:e2e:browsers   # Run E2E tests in all browsers
```

### GOV.UK Frontend Tests
```bash
npm run test:govuk          # Run GOV.UK component tests
npm run test:govuk:watch    # Run GOV.UK tests in watch mode
npm run test:govuk:debug    # Run GOV.UK tests in debug mode
npm run test:cov:govuk      # Run GOV.UK tests with coverage report
```

### Combined Test Commands
```bash
npm run test:all            # Run all tests (unit, integration, GOV.UK, and E2E)
npm run test:all:watch      # Run all tests in watch mode (concurrently)
```

## Code Quality Scripts

### Formatting and Linting
```bash
npm run format             # Format code with Prettier
npm run lint              # Lint code with ESLint
npm run lint:check        # Check code style without fixing
```

## Script Details

### Backend Scripts
- `build`: Compiles TypeScript code using the NestJS compiler
- `start`: Runs the compiled application
- `start:dev`: Runs the application in development mode with auto-reload
- `start:debug`: Runs the application in debug mode with debugging enabled
- `start:prod`: Runs the application in production mode

### Frontend Scripts
- `build:frontend`: Comprehensive frontend build including SCSS compilation, asset copying, and fingerprinting
- `build:frontend:dev`: Build frontend assets optimized for development (skips fingerprinting)
- `build:frontend:watch`: Watches frontend files and rebuilds on changes
- `build:scss`: One-time SCSS compilation
- `build:scss:watch`: Watches SCSS files and recompiles on changes
- `copy:assets`: Copies all static assets to the distribution directory, including:
  - Images from src/frontend/images
  - GOV.UK Frontend assets
  - GOV.UK Frontend dist files
  - All assets from src/public
- `copy:images`: Copies images from src/frontend/images to dist/public/images
- `copy:govuk-assets`: Copies GOV.UK Frontend assets to dist/public/assets
- `copy:govuk-dist`: Copies GOV.UK Frontend dist files to dist/public/govuk
- `copy:public-assets`: Copies all assets from src/public to dist/public
- `fingerprint:assets`: Generates content-based hashes for static assets

### Testing Scripts
- `test`: Runs Jest unit tests
- `test:unit`: Runs unit tests specifically
- `test:integration`: Runs integration tests specifically
- `test:unit:watch`: Runs unit tests in watch mode
- `test:integration:watch`: Runs integration tests in watch mode
- `test:unit:debug`: Runs unit tests in debug mode
- `test:integration:debug`: Runs integration tests in debug mode
- `test:cov`: Generates test coverage report
- `test:cov:unit`: Generates unit test coverage report
- `test:cov:integration`: Generates integration test coverage report
- `test:e2e`: Runs Playwright E2E tests
- `test:e2e:local`: Runs Playwright tests locally with proper setup (includes port cleanup, browser installation, and application build)
- `test:e2e:ui`: Runs Playwright tests with UI mode for interactive debugging
- `test:e2e:debug`: Runs Playwright tests in debug mode
- `test:e2e:chromium`: Runs Playwright tests in Chrome only
- `test:e2e:firefox`: Runs Playwright tests in Firefox only
- `test:e2e:webkit`: Runs Playwright tests in Safari only
- `test:e2e:browsers`: Runs Playwright tests in all browsers
- `test:govuk`: Runs tests specific to GOV.UK Frontend components
- `test:govuk:watch`: Runs GOV.UK tests in watch mode
- `test:govuk:debug`: Runs GOV.UK tests in debug mode
- `test:cov:govuk`: Generates GOV.UK test coverage report
- `test:all`: Runs all tests (unit, integration, GOV.UK, and E2E)
- `test:all:watch`: Runs all tests in watch mode (concurrently)
``` 