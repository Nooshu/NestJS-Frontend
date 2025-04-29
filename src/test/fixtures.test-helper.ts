/**
 * Test helper utilities for GOV.UK Frontend component testing.
 * Provides functions to load and compare component fixtures.
 *
 * @module FixturesTestHelper
 */

import * as fs from 'fs';
import { parse } from 'node-html-parser';
import * as path from 'path';

/**
 * Interface representing a GOV.UK Frontend component fixture.
 *
 * @interface GovukFixture
 */
export interface GovukFixture {
  /** Name of the fixture */
  name: string;
  /** Options to pass to the component */
  options: Record<string, any>;
  /** Expected HTML output */
  html: string;
  /** Whether the fixture is hidden */
  hidden: boolean;
}

/**
 * Interface representing a collection of GOV.UK Frontend component fixtures.
 *
 * @interface GovukComponentFixtures
 */
export interface GovukComponentFixtures {
  /** Name of the component */
  component: string;
  /** Array of component fixtures */
  fixtures: GovukFixture[];
}

/**
 * Loads fixtures for a GOV.UK Frontend component.
 *
 * @function loadFixtures
 * @param {string} componentName - Name of the component to load fixtures for
 * @returns {GovukComponentFixtures} The loaded fixtures
 * @throws {Error} If the fixtures file cannot be found
 */
export function loadFixtures(componentName: string): GovukComponentFixtures {
  const fixturesPath = path.join(
    process.cwd(),
    'node_modules',
    'govuk-frontend',
    'govuk',
    'components',
    componentName,
    'fixtures.json'
  );

  if (!fs.existsSync(fixturesPath)) {
    throw new Error(`Fixtures not found for component ${componentName} at path: ${fixturesPath}`);
  }

  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  return JSON.parse(fixturesContent);
}

/**
 * Normalizes HTML by removing extra whitespace and normalizing text content.
 *
 * @function normalizeHtml
 * @param {string} html - The HTML to normalize
 * @returns {string} The normalized HTML
 */
export function normalizeHtml(html: string): string {
  // Parse the HTML
  const root = parse(html);

  // Normalize text content
  const normalizeText = (node: any) => {
    if (node.nodeType === 3) {
      // Text node
      node.textContent = node.textContent.trim();
    }
    if (node.childNodes) {
      node.childNodes.forEach(normalizeText);
    }
  };

  normalizeText(root);

  // Get the normalized HTML
  const normalizedHtml = root.outerHTML;

  // Normalize attribute order by parsing and rebuilding the HTML
  const normalizedRoot = parse(normalizedHtml);
  const rebuildNode = (node: any): string => {
    if (node.nodeType === 3) {
      // Text node
      return node.textContent;
    }

    const tagName = node.tagName?.toLowerCase() || '';
    const attributes = node.attributes || {};

    // Sort attributes by name
    const sortedAttributes = Object.entries(attributes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const children = node.childNodes.map(rebuildNode).join('');

    if (tagName) {
      return `<${tagName}${sortedAttributes ? ' ' + sortedAttributes : ''}>${children}</${tagName}>`;
    }

    return children;
  };

  return rebuildNode(normalizedRoot);
}

/**
 * Compares two HTML strings for equality after normalization.
 *
 * @function compareHtml
 * @param {string} actual - The actual HTML output
 * @param {string} expected - The expected HTML output
 * @returns {boolean} Whether the HTML strings match after normalization
 */
export function compareHtml(actual: string, expected: string): boolean {
  const normalizedActual = normalizeHtml(actual);
  const normalizedExpected = normalizeHtml(expected);

  // Compare the normalized HTML
  return normalizedActual === normalizedExpected;
}
