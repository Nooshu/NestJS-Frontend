# Development Guidelines

## Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for new development

## Testing

- Write unit tests for services and controllers
- Use Jest for testing
- Maintain good test coverage

### Testing Commands

The application provides comprehensive testing capabilities:

#### Unit and Integration Tests
```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run tests in watch mode
npm run test:unit:watch
npm run test:integration:watch

# Run tests in debug mode
npm run test:unit:debug
npm run test:integration:debug

# Run tests with coverage
npm run test:cov:unit
npm run test:cov:integration
```

#### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests locally with proper setup (recommended)
npm run test:e2e:local

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in specific browsers
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run E2E tests in all browsers
npm run test:e2e:browsers
```

#### GOV.UK Component Tests
```bash
# Run GOV.UK component tests
npm run test:govuk

# Run GOV.UK tests in watch mode
npm run test:govuk:watch

# Run GOV.UK tests in debug mode
npm run test:govuk:debug

# Run GOV.UK tests with coverage
npm run test:cov:govuk
```

#### Combined Test Commands
```bash
# Run all tests (unit, integration, GOV.UK, and E2E)
npm run test:all

# Run all tests in watch mode (concurrently)
npm run test:all:watch
```

### Component Testing

The application includes a comprehensive component testing system that verifies GOV.UK Frontend components against official test fixtures. To run component tests:

1. Run all component tests:
```bash
npm run test:govuk
```

2. Run specific component tests:
```bash
npm test -- --testPathPattern=button.component
```

3. Generate test coverage:
```bash
npm run test:cov:govuk
```

Component tests automatically:
- Compare rendered output with official GOV.UK Frontend fixtures
- Generate detailed test reports in `test-output/govuk-components/`
- Verify component accessibility and styling
- Test multiple scenarios for each component

For detailed information about component testing, see [Component Testing Documentation](../component-testing.md).

## Documentation

- Document complex functions and classes
- Keep README up to date
- Use JSDoc for API documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request 

## Frontend Development

### Build Process

The frontend build process is handled through several npm scripts:

1. For development with live reload:
```bash
npm run build:frontend:watch
```

2. For production builds:
```bash
npm run build:frontend
```

3. For development builds (skips fingerprinting):
```bash
npm run build:frontend:dev
```

### Asset Management

- SCSS files are located in `src/frontend/scss/`
- Frontend images and assets are in `src/frontend/images/`
- Public static assets are in `src/public/`
- Built assets are output to `dist/public/`
- GOV.UK Frontend assets are automatically copied to `dist/public/assets/`

The application supports two types of static assets:
1. Frontend-specific assets (`src/frontend/images/`):
   - Used for frontend-specific images and assets
   - Copied to `dist/public/images/`
   - Typically used for UI components and frontend-specific resources

2. Public static assets (`src/public/`):
   - Used for general public assets
   - Copied to `dist/public/`
   - Maintains the same directory structure in the dist folder
   - Suitable for court images, documents, and other public resources

### Best Practices

- Use SCSS for styling to maintain consistency with GOV.UK Frontend
- Keep images optimized and in appropriate formats
- Place frontend-specific assets in `src/frontend/images/`
- Place general public assets in `src/public/`
- Use appropriate subdirectories to organize assets
- Follow naming conventions for assets
- Document any special asset requirements
- Follow the GOV.UK Design System guidelines for components and patterns
- Test frontend changes across different browsers and devices 