import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';

export const govukTestConfig = {
  // Path to GOV.UK Frontend package
  govukFrontendPath: join(process.cwd(), 'node_modules', 'govuk-frontend'),
  
  // Components to test
  components: [
    'accordion',
    'back-link',
    'breadcrumbs',
    'button',
    'character-count',
    'checkboxes',
    'cookie-banner',
    'date-input',
    'details',
    'error-message',
    'error-summary',
    'fieldset',
    'file-upload',
    'footer',
    'header',
    'input',
    'inset-text',
    'notification-banner',
    'pagination',
    'panel',
    'phase-banner',
    'radios',
    'select',
    'skip-link',
    'summary-list',
    'table',
    'tabs',
    'tag',
    'textarea',
    'warning-text',
  ],

  // Test scenarios for each component
  scenarios: {
    // Example: accordion scenarios
    accordion: [
      'default',
      'with-additional-descriptions',
      'with-all-sections-already-open',
      'with-focusable-elements-inside',
      'with-long-content-and-description',
      'with-one-section-open',
      'with-translations',
    ],
    // Add more component scenarios as needed
  },

  // Test output directory
  outputDir: join(process.cwd(), 'test-output', 'govuk-components'),

  // Path to component fixtures
  getFixturePath: (componentName: string, scenarioName: string) => {
    // Remove 'template-' prefix if it exists in the scenario name
    const cleanScenarioName = scenarioName.startsWith('template-') 
      ? scenarioName.substring('template-'.length)
      : scenarioName;
    
    return join(
      process.cwd(),
      'node_modules',
      'govuk-frontend',
      'dist',
      'govuk',
      'components',
      componentName,
      `template-${cleanScenarioName}.html`
    );
  },

  // Path to component scenarios directory
  getScenariosPath: (componentName: string) => {
    return join(
      process.cwd(),
      'node_modules',
      'govuk-frontend',
      'dist',
      'govuk',
      'components',
      componentName
    );
  },

  // Get available scenarios for a component
  getComponentScenarios: (componentName: string): string[] => {
    const scenariosDir = govukTestConfig.getScenariosPath(componentName);
    const files = readdirSync(scenariosDir);
    return files
      .filter(file => file.startsWith('template-') && file.endsWith('.html'))
      .map(file => file.replace('template-', '').replace('.html', ''));
  },

  // Get template content directly
  getTemplateContent: (componentName: string, scenarioName: string): string => {
    const templatePath = govukTestConfig.getFixturePath(componentName, scenarioName);
    return readFileSync(templatePath, 'utf8');
  }
}; 