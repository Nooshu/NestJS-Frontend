/**
 * Homepage End-to-End Tests
 * 
 * This test suite verifies the functionality of the application's homepage.
 * It uses Playwright's test runner and assertion library to perform browser-based testing.
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  /**
   * Test: Homepage Loading
   * 
   * Verifies that the homepage loads correctly and contains the expected elements.
   * This test checks:
   * 1. Navigation to the homepage
   * 2. Proper page loading completion
   * 3. Page title existence
   * 4. Main content visibility
   * 
   * @param {Page} page - The Playwright Page object representing the browser context
   */
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage using the baseURL configured in playwright.config.ts
    // The '/' path will be appended to the baseURL (http://localhost:3000)
    await page.goto('/');

    // Wait for the network to be idle (no active requests for 500ms)
    // This ensures all resources (JS, CSS, images) have been loaded
    await page.waitForLoadState('networkidle');

    // Verify that the page has a non-empty title
    // This is a basic check to ensure the page has loaded some content
    expect(await page.title()).toBeTruthy();
    
    // Locate and verify the main content area
    // Using the semantic <main> element as a reliable selector
    // This is better than using classes or IDs which might change
    const mainContent = await page.locator('main');
    
    // Assert that the main content is visible to the user
    // This verifies that the core content area is rendered and displayed
    await expect(mainContent).toBeVisible();
  });
}); 