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

- `npm run start:dev` - Start development server with hot reload
  - Automatically compiles TypeScript on the fly
  - Watches for file changes and recompiles automatically
  - Provides hot reloading for faster development
  - Shows detailed error messages in the console
  - Ideal for development workflow

- `npm run build` - Build the application
  - Compiles TypeScript to JavaScript
  - Generates type declaration files
  - Copies static assets to dist directory
  - Creates production-ready version in dist/
  - Use before deployment or testing production build

- `npm run start:prod` - Start production server
  - Runs the built application from dist/
  - Uses production optimizations
  - No hot reloading or development features
  - Use for testing production build locally

- `npm run test` - Run tests
  - Executes all test files
  - Uses Jest test runner
  - Shows test coverage

- `npm run format` - Format code with Prettier
  - Applies consistent code formatting
  - Uses project's Prettier configuration

- `npm run lint` - Run ESLint
  - Checks code for style and potential issues
  - Automatically fixes fixable issues

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