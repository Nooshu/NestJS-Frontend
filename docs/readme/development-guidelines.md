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

### Component Testing

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