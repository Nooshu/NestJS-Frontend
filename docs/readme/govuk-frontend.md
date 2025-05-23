# Updating GOV.UK Frontend

The application uses the GOV.UK Frontend package (`govuk-frontend`) for styling and components. The current version is 5.10.1 as specified in `package.json`.

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
   Current version should be 5.10.1

3. Review the current configuration:
   - Check `src/adapters/security-compliance/govuk.config.ts` for any configuration changes
   - Review `src/frontend/scss/main.scss` for any custom styles that might need updating
   - Check `src/adapters/express/govuk.ts` for any adapter changes

## Update Process

1. Update the package version:
   ```bash
   npm install govuk-frontend@latest
   ```
   Or for a specific version:
   ```bash
   npm install govuk-frontend@x.x.x
   ```

2. Update the package-lock.json file:
   ```bash
   npm install
   ```

3. Update static assets:
   - The application serves GOV.UK Frontend assets from:
     ```
     node_modules/govuk-frontend/dist/govuk
     ```
   - Assets are automatically served via the static asset configuration in `main.ts`
   - Run the frontend build process:
     ```bash
     npm run build:frontend
     ```
   - For development with live reload:
     ```bash
     npm run build:frontend:watch
     ```

4. Run component tests:
   ```bash
   npm run test:govuk
   ```
   This ensures all GOV.UK components still render correctly after the update.

5. Update asset fingerprinting:
   - After a GOV.UK Frontend update, you need to re-fingerprint all assets:
     ```bash
     npm run fingerprint:assets
     ```
   - This will generate new content hashes for all static assets, including GOV.UK Frontend assets
   - The manifest file will be updated automatically
   - Assets will be properly referenced through the `assetPath` function in templates

6. Check component test configuration:
   - Review `src/test/govuk-components.test.config.ts` for any new components
   - Update test scenarios if needed
   - Run specific component tests:
     ```bash
     npm run test:govuk -- --testPathPattern=component-name
     ```

## Post-Update Checklist

1. Verify template paths in `view-engine.service.ts` are correct:
   ```typescript
   const govukPath = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist');
   ```

2. Check component imports in Nunjucks templates:
   - Update any changed macro paths
   - Review deprecated components
   - Test new component features if applicable
   - Verify that all components use the `assetPath` function for assets:
     ```nunjucks
     <link href="{{ assetPath('/assets/govuk/govuk-frontend.min.css') }}" rel="stylesheet">
     <script src="{{ assetPath('/assets/govuk/govuk-frontend.min.js') }}"></script>
     ```

3. Update CSS/SCSS imports if using custom styles:
   - Review `src/frontend/scss/main.scss`
   - Update any deprecated SASS variables or mixins
   - Check for new SASS features or improvements
   - Ensure your custom styles are compatible with the new GOV.UK Frontend version

4. Update JavaScript initialization:
   - Check if the GOV.UK Frontend JavaScript initialization needs updating
   - Verify that all required JavaScript modules are imported
   - Test interactive components like accordions, tabs, and error summaries

5. Test the application thoroughly:
   - Run all tests: `npm test`
   - Check visual appearance of components
   - Verify responsive behavior
   - Test accessibility features (run accessibility tests)
   - Run performance tests
   - Check browser compatibility
   - Test with assistive technologies if possible

6. Update security configuration if needed:
   - Review `src/adapters/security-compliance/govuk.config.ts`
   - Update any deprecated configuration options
   - Add new configuration options if available
   - Check Content Security Policy settings for any new requirements

7. Verify fingerprinted assets:
   - Check that the manifest file includes all GOV.UK Frontend assets
   - Verify that asset references in HTML are correct
   - Test caching behavior with the new assets
   - Ensure all GOV.UK Frontend assets load correctly with their fingerprinted URLs

8. Update documentation:
   - Update any documentation that references GOV.UK Frontend components
   - Update version information in project documentation
   - Document any migration steps taken for future reference

## Complete Build Process After Update

After updating GOV.UK Frontend, run the complete build process:

```bash
# Clean the dist directory
rm -rf dist

# Build the NestJS application
npm run build

# Build all frontend assets (SCSS, copy assets)
npm run build:scss
npm run copy:assets

# Fingerprint all assets
npm run fingerprint:assets

# Test the application
npm run test:govuk
npm test

# Start the application
npm run start:prod
```

## Troubleshooting

Common issues after updating:

1. Missing assets
   - Verify the static asset paths in `main.ts`
   - Check the `govuk-frontend` package structure hasn't changed
   - Run `npm run copy:assets` to ensure all assets are copied
   - Check that asset fingerprinting includes all required files

2. Component rendering issues
   - Compare component usage with latest documentation
   - Check for breaking changes in the release notes
   - Review component test output in `test-output/govuk-components/`
   - Check Nunjucks template compatibility
   - Verify Nunjucks paths and macro imports

3. Style conflicts
   - Review any custom styles that might override GOV.UK Frontend
   - Check for deprecated or changed class names
   - Review SASS compilation output for warnings
   - Test with and without your custom styles to isolate issues

4. Build issues
   - Clear the `dist` directory and rebuild
   - Check SASS compilation logs
   - Verify asset copying process
   - Ensure fingerprinting script runs correctly
   - Check manifest file for errors or omissions

5. JavaScript initialization issues
   - Check browser console for errors
   - Verify that GOV.UK Frontend JavaScript is properly initialized
   - Test JavaScript-dependent components individually

6. Caching issues
   - Clear browser cache during testing
   - Verify that fingerprinted assets have proper cache headers
   - Check that asset URLs change when content changes
   - Test with browser developer tools network panel

For detailed information about GOV.UK Frontend versions and migration guides, visit the [official documentation](https://frontend.design-system.service.gov.uk/).

## Version History

| Version | Date Updated | Changes |
|---------|--------------|---------|
| 5.10.1  | Current      | Latest stable release |
| 5.10.0  | Previous     | Previous stable release |
| 5.9.0   | Previous     | Previous stable release |
| 5.8.0   | Previous     | Previous stable release |
| 5.7.0   | Previous     | Previous stable release |
| 5.6.0   | Previous     | Previous stable release |
| 5.5.0   | Previous     | Previous stable release |
| 5.4.0   | Previous     | Previous stable release |
| 5.3.0   | Previous     | Previous stable release |
| 5.2.0   | Previous     | Previous stable release |
| 5.1.0   | Previous     | Previous stable release |
| 5.0.0   | Initial      | Initial implementation |

## Related Documentation

- [Asset Fingerprinting](../asset-fingerprinting.md)
- [Frontend Performance](./frontend-performance.md)
- [Build Scripts](../build-scripts.md) 