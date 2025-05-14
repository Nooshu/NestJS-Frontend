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
npm run build:frontend:watch # Watch and rebuild frontend assets
npm run build:scss          # Compile SCSS to CSS
npm run build:scss:watch    # Watch and compile SCSS
npm run copy:assets         # Copy static assets to output directory
npm run fingerprint:assets  # Generate fingerprinted assets
```

## Testing Scripts

### Unit and Integration Tests (Jest)
```bash
npm run test                # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:debug         # Run tests in debug mode
```

### End-to-End Tests (Playwright)
```bash
npm run test:e2e:ui        # Run E2E tests with UI mode for interactive debugging
npm run test:e2e:debug     # Run E2E tests in debug mode with browser inspector
npm run test:e2e:chromium  # Run E2E tests specifically in Chrome
npm run test:e2e:firefox   # Run E2E tests specifically in Firefox
npm run test:e2e:webkit    # Run E2E tests specifically in Safari
```

### GOV.UK Frontend Tests
```bash
npm run test:govuk         # Run GOV.UK component tests
npm run test:govuk:watch   # Run GOV.UK tests in watch mode
npm run test:govuk:cov     # Run GOV.UK tests with coverage report
```

## Code Quality Scripts

### Formatting and Linting
```bash
npm run format             # Format code with Prettier
npm run lint              # Lint code with ESLint
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
- `build:frontend:watch`: Watches frontend files and rebuilds on changes
- `build:scss`: One-time SCSS compilation
- `build:scss:watch`: Watches SCSS files and recompiles on changes
- `copy:assets`: Copies static assets to the distribution directory
- `fingerprint:assets`: Generates content-based hashes for static assets

### Testing Scripts
- `test`: Runs Jest unit tests
- `test:watch`: Runs Jest tests in watch mode
- `test:cov`: Generates test coverage report
- `test:debug`: Runs tests with Node.js inspector
- `test:e2e:ui`: Runs Playwright tests with UI mode for interactive debugging
- `test:e2e:debug`: Runs Playwright tests in debug mode
- `test:e2e:chromium`: Runs Playwright tests in Chrome only
- `test:e2e:firefox`: Runs Playwright tests in Firefox only
- `test:e2e:webkit`: Runs Playwright tests in Safari only
- `test:govuk`: Runs tests specific to GOV.UK Frontend components

### Code Quality Scripts
- `format`: Formats all TypeScript files using Prettier
- `lint`: Lints all TypeScript files using ESLint

## Usage Examples

### Development Workflow
```bash
# Terminal 1 - Backend development
npm run start:dev

# Terminal 2 - Frontend development
npm run build:frontend:watch

# Terminal 3 - Testing
npm run test:watch
```

### Testing Workflow
```bash
# Run all tests before committing
npm run test
npm run test:e2e:chromium

# Debug specific tests
npm run test:e2e:debug

# Interactive test development
npm run test:e2e:ui
```

### Production Build
```bash
# Build and start production version
npm run build && npm run build:frontend && npm run start:prod
``` 