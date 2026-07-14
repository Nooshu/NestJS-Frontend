/**
 * Basic smoke tests for the NestJS + GOV.UK Frontend app.
 *
 * Purpose: quick confidence that the process is up, core HTML chrome renders,
 * and a key journey entry point responds — without replacing full E2E coverage.
 *
 * Prefer real HTTP checks for /health (JSON) and DOM checks for GOV.UK macros
 * (skip link, header, main) so failures point at bootstrap or layout regressions.
 * The CSS version custom property check catches a mismatched or missing
 * govuk-frontend stylesheet after upgrades or fingerprint/copy failures.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/** Installed govuk-frontend version from package.json (exact pin). */
function expectedGovukFrontendVersion(): string {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const version = pkg.dependencies?.['govuk-frontend'];
  if (!version) {
    throw new Error('govuk-frontend is not listed in package.json dependencies');
  }
  return version;
}

test.describe('Smoke', () => {
  test('health endpoint returns ok JSON', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type'] ?? '').toMatch(/json/i);

    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
  });

  test('robots.txt is served', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text.toLowerCase()).toContain('user-agent');
  });

  test('homepage renders GOV.UK layout chrome', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Skip link is intentionally visually hidden until focused (GOV.UK pattern)
    await expect(page.locator('.govuk-skip-link')).toBeAttached();
    await expect(page.locator('header.govuk-header, .govuk-header').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1.govuk-heading-xl, h1').first()).toBeVisible();
    await expect(page.locator('footer.govuk-footer, .govuk-footer').first()).toBeVisible();
  });

  test('served GOV.UK Frontend CSS exposes --govuk-frontend-version matching package.json', async ({
    page,
    request,
  }) => {
    const expectedVersion = expectedGovukFrontendVersion();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const stylesheetHref = await page
      .locator('link[rel="stylesheet"][href*="govuk-frontend"]')
      .first()
      .getAttribute('href');

    expect(stylesheetHref, 'homepage should link govuk-frontend CSS').toBeTruthy();

    const cssResponse = await request.get(stylesheetHref!);
    expect(cssResponse.ok(), `failed to fetch ${stylesheetHref}`).toBeTruthy();

    const css = await cssResponse.text();
    expect(css).toContain('--govuk-frontend-version:');

    // Official dist CSS uses --govuk-frontend-version:"x.y.z" (optional quotes/space)
    const match = css.match(/--govuk-frontend-version\s*:\s*["']?([^;"'\s}]+)/);
    expect(match?.[1], 'CSS custom property value').toBe(expectedVersion);

    // Confirm the property is applied on the document (not only present in the file)
    const computed = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--govuk-frontend-version').trim()
    );
    expect(computed.replace(/^["']|["']$/g, '')).toBe(expectedVersion);
  });

  test('Find a Court or Tribunal start page loads', async ({ page }) => {
    await page.goto('/find-a-court-or-tribunal');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    // Page should stay within the GOV.UK template
    await expect(page.locator('.govuk-template, body').first()).toBeVisible();
  });

  test('second demo page loads', async ({ page }) => {
    await page.goto('/second-page');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
