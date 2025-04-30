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
    'dist',
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

    // Define attribute order for specific elements
    const attributeOrder: Record<string, string[]> = {
      a: ['href', 'role', 'draggable', 'class', 'data-module', 'name', 'type', 'value', 'data-prevent-double-click'],
      button: ['type', 'name', 'disabled', 'aria-disabled', 'class', 'data-module', 'data-prevent-double-click', 'value'],
      input: ['type', 'name', 'disabled', 'aria-disabled', 'class', 'data-module', 'data-prevent-double-click', 'value']
    };

    // Get the ordered attributes for this element type
    const orderedAttributes = attributeOrder[tagName] || [];

    // Sort attributes based on the defined order
    const sortedAttributes = Object.entries(attributes)
      .sort(([a], [b]) => {
        const aIndex = orderedAttributes.indexOf(a);
        const bIndex = orderedAttributes.indexOf(b);
        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b);
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
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

  // Add detailed logging
  console.log('\nComparing HTML:');
  console.log('Expected:', JSON.stringify(expected));
  console.log('Actual:', JSON.stringify(actual));
  console.log('Normalized Expected:', JSON.stringify(normalizedExpected));
  console.log('Normalized Actual:', JSON.stringify(normalizedActual));
  
  // Compare character by character
  for (let i = 0; i < Math.max(normalizedExpected.length, normalizedActual.length); i++) {
    if (normalizedExpected[i] !== normalizedActual[i]) {
      console.log('\nFirst difference at position', i);
      console.log('Expected char:', JSON.stringify(normalizedExpected[i] || 'EOF'));
      console.log('Actual char:', JSON.stringify(normalizedActual[i] || 'EOF'));
      console.log('Context (expected):', JSON.stringify(normalizedExpected.substring(Math.max(0, i - 20), i + 20)));
      console.log('Context (actual):', JSON.stringify(normalizedActual.substring(Math.max(0, i - 20), i + 20)));
      break;
    }
  }

  // Compare the normalized HTML
  return normalizedActual === normalizedExpected;
}
