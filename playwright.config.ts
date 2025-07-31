/**
 * Playwright Test Configuration
 * 
 * This configuration file sets up Playwright for end-to-end testing of the NestJS frontend application.
 * It includes settings for:
 * - Test directory location
 * - Browser configurations
 * - Test execution settings
 * - Reporter configuration
 * - Screenshot and trace settings
 * - Local development server setup
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Load Environment Variables
 * 
 * Import and configure dotenv to load environment variables from .env file.
 * These variables can be used in the configuration and tests.
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Playwright Configuration
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* Directory where test files are located */
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI to handle flaky tests */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI to prevent resource contention */
  workers: process.env.CI ? 1 : undefined,

  /* Configure test reporting - using HTML reporter for rich test results */
  reporter: process.env.CI ? 'dot' : 'html',

  /* Global settings applied to all tests */
  use: {
    /* Base URL for all page.goto() calls */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test for debugging */
    trace: 'on-first-retry',

    /* Capture screenshots on test failure for debugging */
    screenshot: 'only-on-failure',

    /* Set longer timeout for CI environments */
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 30000 : 10000,
  },

  /* Configure browser-specific test projects */
  projects: [
    {
      /* Chromium (Chrome/Edge) test configuration */
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      /* Firefox test configuration */
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      /* WebKit (Safari) test configuration */
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Configure the local development server to run during tests */
  webServer: {
    /* Command to start the server - use production build in CI for faster startup */
    command: process.env.CI 
      ? 'npm run start:prod' 
      : 'npm run start:dev',
    
    /* URL where the server will be running */
    url: 'http://localhost:3000',
    
    /* Reuse the server instance if it's already running (except in CI) */
    reuseExistingServer: !process.env.CI,
    
    /* Maximum time to wait for the server to start (5 minutes in CI, 2 minutes locally) */
    timeout: process.env.CI ? 300 * 1000 : 120 * 1000,

    /* Wait for the server to be ready by checking the health endpoint */
    stdout: 'Application is running on: http://localhost:3000',
    stderr: 'error',
  },
});
