# Updating GOV.UK Frontend

The application uses the GOV.UK Frontend package (`govuk-frontend`) for styling and components. The current version is 5.9.0 as specified in `package.json`.

## Before Updating

1. Check the [GOV.UK Frontend release notes](https://github.com/alphagov/govuk-frontend/releases) for:
   - Breaking changes
   - New features
   - Deprecated features
   - Required migration steps

2. Review the current integration:
   ```bash
   npm list govuk-frontend
   ```
   Current version should be 5.9.0

## Update Process

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

## Post-Update Checklist

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
   - Verify responsive Behaviour
   - Test accessibility features

## Troubleshooting

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