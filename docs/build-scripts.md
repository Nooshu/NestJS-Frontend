# Build Scripts Documentation

This document describes all the build scripts available in the project's `package.json` file, explaining what each one does and when to use it.

## NestJS Application Build Scripts

### Main Application Build

```bash
# Compile the NestJS application
npm run build
```

This script compiles the TypeScript code into JavaScript using the NestJS CLI. It reads the configuration from `tsconfig.json` and outputs the compiled files to the `dist` directory.

### Running the Application

```bash
# Start the application in production mode (requires build first)
npm run start

# Start the application in development mode with auto-reload
npm run start:dev

# Start the application in debug mode
npm run start:debug

# Start in production mode from compiled files
npm run start:prod
```

- `start`: Runs the compiled application without watching for changes
- `start:dev`: Runs the application in watch mode, automatically reloading when files change
- `start:debug`: Runs the application in debug mode with source maps, enabling attachment of a debugger
- `start:prod`: Runs the compiled application from the `dist` directory

## Frontend Assets Build Scripts

### Complete Frontend Build

```bash
# Build all frontend assets
npm run build:frontend

# Build frontend assets and watch for changes
npm run build:frontend:watch
```

The `build:frontend` script is the main command for building all frontend assets. It:
1. Compiles SCSS to CSS
2. Copies static assets to the output directory
3. Applies asset fingerprinting for optimal caching

### SCSS Compilation

```bash
# Compile SCSS to CSS
npm run build:scss

# Compile SCSS to CSS and watch for changes
npm run build:scss:watch
```

These scripts compile SCSS files from `src/frontend/scss/main.scss` to CSS in `dist/public/css/main.css`:
- `build:scss`: One-time compilation with compression
- `build:scss:watch`: Watches for changes in SCSS files and recompiles automatically

### Asset Management

```bash
# Copy static assets to the output directory
npm run copy:assets

# Apply fingerprinting to static assets
npm run fingerprint:assets
```

- `copy:assets`: Copies images from `src/frontend/images` to `dist/public/images` and GOV.UK Frontend assets to their respective directories
- `fingerprint:assets`: Generates content-based hashes for static assets and creates a manifest file that maps original paths to fingerprinted paths

## Code Quality Scripts

```bash
# Format code using Prettier
npm run format

# Lint code using ESLint
npm run lint
```

- `format`: Formats TypeScript files using Prettier
- `lint`: Lints TypeScript files using ESLint and fixes auto-fixable issues

## Testing Scripts

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run tests in debug mode
npm run test:debug

# Run end-to-end tests
npm run test:e2e

# Run GOV.UK component tests
npm run test:govuk

# Run GOV.UK component tests in watch mode
npm run test:govuk:watch

# Run GOV.UK component tests with coverage
npm run test:govuk:cov
```

- `test`: Runs all unit tests using Jest
- `test:watch`: Runs tests in watch mode, re-running tests when files change
- `test:cov`: Runs tests and generates a coverage report
- `test:debug`: Runs tests in debug mode with Node.js inspector
- `test:e2e`: Runs end-to-end tests using Jest
- `test:govuk`: Runs tests specifically for GOV.UK components
- `test:govuk:watch`: Runs GOV.UK component tests in watch mode
- `test:govuk:cov`: Runs GOV.UK component tests with coverage report

## Development Workflow Examples

### Complete Development Build Workflow

For a complete development build with auto-reloading:

```bash
# In one terminal (for backend)
npm run start:dev

# In another terminal (for frontend)
npm run build:frontend:watch
```

### Production Build

For a production build:

```bash
# Build everything
npm run build && npm run build:frontend

# Run the application
npm run start:prod
```

### Testing During Development

While developing, you can run tests in watch mode:

```bash
# For application tests
npm run test:watch

# For GOV.UK component tests
npm run test:govuk:watch
``` 