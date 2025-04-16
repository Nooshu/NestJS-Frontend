# NestJS Frontend Application

A NestJS application with GOV.UK Frontend integration.

## Project Structure

```
src/
├── modules/         # Feature modules
├── shared/          # Shared utilities and services
│   ├── config/     # Configuration files
│   ├── constants/  # Application constants
│   ├── decorators/ # Custom decorators
│   ├── guards/     # Authentication/Authorization guards
│   ├── interfaces/ # TypeScript interfaces
│   ├── middleware/ # Custom middleware
│   ├── services/   # Shared services
│   └── utils/      # Utility functions
├── views/          # Nunjucks templates
└── public/         # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

### Available Scripts

#### Development
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
  - Uses production optimizations

#### Building
- `npm run build` - Build the application
  - Compiles TypeScript to JavaScript
  - Generates production-ready code in dist/

#### Testing
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
- `npm run test:govuk` - Run GOV.UK component tests
  - Tests specific to GOV.UK Frontend components
- `npm run test:govuk:watch` - Run GOV.UK tests in watch mode
  - Continuously watches for changes in GOV.UK component tests
- `npm run test:govuk:cov` - Run GOV.UK tests with coverage
  - Generates coverage report for GOV.UK component tests

#### Code Quality
- `npm run format` - Format code with Prettier
  - Formats all TypeScript files in src/ and test/
  - Ensures consistent code style
- `npm run lint` - Run ESLint
  - Lints all TypeScript files
  - Automatically fixes fixable issues
  - Checks code style and potential problems

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for new development

### Testing

- Write unit tests for services and controllers
- Use Jest for testing
- Maintain good test coverage

#### Component Testing

The application includes a comprehensive component testing system that verifies GOV.UK Frontend components against official test fixtures. To run component tests:

1. Run all component tests:
```bash
npm test -- --testPathPattern=govuk-components
```

2. Run specific component tests:
```bash
npm test -- --testPathPattern=button.component
```

3. Generate test coverage:
```bash
npm run test:cov
```

Component tests automatically:
- Compare rendered output with official GOV.UK Frontend fixtures
- Generate detailed test reports in `test-output/govuk-components/`
- Verify component accessibility and styling
- Test multiple scenarios for each component

For detailed information about component testing, see [Component Testing Documentation](docs/component-testing.md).

### Documentation

- Document complex functions and classes
- Keep README up to date
- Use JSDoc for API documentation

## Deployment

The application can be deployed using:

```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Updating GOV.UK Frontend

The application uses the GOV.UK Frontend package (`govuk-frontend`) for styling and components. The current version is specified in `package.json`.

### Before Updating

1. Check the [GOV.UK Frontend release notes](https://github.com/alphagov/govuk-frontend/releases) for:
   - Breaking changes
   - New features
   - Deprecated features
   - Required migration steps

2. Review the current integration:
   ```bash
   npm list govuk-frontend
   ```

### Update Process

1. Update the package version:
   ```bash
   npm install govuk-frontend@latest
   ```
   Or for a specific version:
   ```bash
   npm install govuk-frontend@x.x.x
   ```

2. Update static assets:
   - The application serves GOV.UK Frontend assets from:
     ```
     node_modules/govuk-frontend/dist/govuk
     ```
   - Assets are automatically served via the static asset configuration in `main.ts`

3. Run component tests:
   ```bash
   npm run test:govuk
   ```
   This ensures all GOV.UK components still render correctly after the update.

### Post-Update Checklist

1. Verify template paths in `view-engine.service.ts` are correct:
   ```typescript
   const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');
   ```

2. Check component imports in Nunjucks templates:
   - Update any changed macro paths
   - Review deprecated components
   - Test new component features if applicable

3. Update CSS/SCSS imports if using custom styles

4. Test the application:
   - Run all tests: `npm test`
   - Check visual appearance of components
   - Verify responsive behavior
   - Test accessibility features

### Troubleshooting

Common issues after updating:

1. Missing assets
   - Verify the static asset paths in `main.ts`
   - Check the `govuk-frontend` package structure hasn't changed

2. Component rendering issues
   - Compare component usage with latest documentation
   - Check for breaking changes in the release notes
   - Review component test output in `test-output/govuk-components/`

3. Style conflicts
   - Review any custom styles that might override GOV.UK Frontend
   - Check for deprecated or changed class names

For detailed information about GOV.UK Frontend versions and migration guides, visit the [official documentation](https://frontend.design-system.service.gov.uk/). 