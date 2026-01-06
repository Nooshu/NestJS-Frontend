/**
 * Test helper utilities for GOV.UK Frontend component testing.
 * Provides functions to load and compare component fixtures.
 *
 * @module FixturesTestHelper
 */

import * as fs from 'fs';
import { parse, HTMLElement } from 'node-html-parser';
import * as path from 'path';
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainElement(element: HTMLElement): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
    }
  }
}

// Extend expect
declare module '@jest/globals' {
  interface Matchers<R> {
    toContainElement(element: HTMLElement): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveClass(className: string): R;
  }
}

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
 * Normalizes HTML by removing extra whitespace and normalizing line endings.
 *
 * @function normalizeHtml
 * @param {string} html - The HTML to normalize
 * @returns {string} The normalized HTML
 */
export function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').replace(/\n/g, '').trim();
}

/**
 * Gets class names from a class list.
 *
 * @function getClassNames
 * @param {string} classList - The class list string
 * @returns {string[]} Array of class names
 */
function getClassNames(classList: string): string[] {
  return classList.split(' ').filter(Boolean);
}

/**
 * Compares rendered HTML with fixture HTML using @testing-library/jest-dom.
 *
 * @function compareHtml
 * @param {string} rendered - The rendered HTML
 * @param {string} fixture - The fixture HTML
 * @returns {boolean} Whether the HTML matches
 */
export function compareHtml(rendered: string, fixture: string): boolean {
  // Normalize both HTML strings
  const normalizedRendered = normalizeHtml(rendered);
  const normalizedFixture = normalizeHtml(fixture);

  // Parse both HTML strings into DOM
  const renderedDoc = parse(normalizedRendered);
  const fixtureDoc = parse(normalizedFixture);

  // Get the root elements
  const renderedRoot = renderedDoc.firstChild as HTMLElement;
  const fixtureRoot = fixtureDoc.firstChild as HTMLElement;

  if (!renderedRoot || !fixtureRoot) {
    console.log('Missing root elements:', { renderedRoot, fixtureRoot });
    return false;
  }

  // Compare attributes
  const renderedAttrs = renderedRoot.attributes || {};
  const fixtureAttrs = fixtureRoot.attributes || {};

  const renderedAttrKeys = Object.keys(renderedAttrs);
  const fixtureAttrKeys = Object.keys(fixtureAttrs);

  if (renderedAttrKeys.length !== fixtureAttrKeys.length) {
    console.log('Attribute count mismatch:', {
      rendered: renderedAttrKeys,
      fixture: fixtureAttrKeys,
    });
    return false;
  }

  for (const key of fixtureAttrKeys) {
    if (renderedAttrs[key] !== fixtureAttrs[key]) {
      console.log('Attribute value mismatch:', {
        key,
        rendered: renderedAttrs[key],
        fixture: fixtureAttrs[key],
      });
      return false;
    }
  }

  // Compare class names
  const renderedClasses = getClassNames(renderedRoot.classNames || '');
  const fixtureClasses = getClassNames(fixtureRoot.classNames || '');

  if (renderedClasses.length !== fixtureClasses.length) {
    console.log('Class count mismatch:', {
      rendered: renderedClasses,
      fixture: fixtureClasses,
    });
    return false;
  }

  for (const className of fixtureClasses) {
    if (!renderedClasses.includes(className)) {
      console.log('Missing class:', className);
      return false;
    }
  }

  // Compare text content
  const renderedText = normalizeHtml(renderedRoot.text || '');
  const fixtureText = normalizeHtml(fixtureRoot.text || '');

  if (renderedText !== fixtureText) {
    console.log('Text content mismatch:', {
      rendered: renderedText,
      fixture: fixtureText,
    });
    return false;
  }

  // Compare child elements recursively
  const renderedChildren = renderedRoot.childNodes;
  const fixtureChildren = fixtureRoot.childNodes;

  if (renderedChildren.length !== fixtureChildren.length) {
    console.log('Child count mismatch:', {
      rendered: renderedChildren.length,
      fixture: fixtureChildren.length,
    });
    return false;
  }

  for (let i = 0; i < fixtureChildren.length; i++) {
    if (!compareHtml(renderedChildren[i].toString(), fixtureChildren[i].toString())) {
      console.log('Child element mismatch at index:', i);
      return false;
    }
  }

  return true;
}

/**
 * Verifies a component's rendered output against its fixture using @testing-library/jest-dom.
 *
 * @function verifyComponent
 * @param {string} rendered - The rendered HTML
 * @param {GovukFixture} fixture - The fixture to compare against
 */
export function verifyComponent(rendered: string, fixture: GovukFixture): void {
  // Parse the rendered HTML
  const renderedDoc = parse(rendered.trim());
  const renderedRoot = renderedDoc.firstChild as HTMLElement;

  if (!renderedRoot) {
    throw new Error('Failed to parse rendered HTML');
  }

  // Parse the fixture HTML
  const fixtureDoc = parse(fixture.html.trim());
  const fixtureRoot = fixtureDoc.firstChild as HTMLElement;

  if (!fixtureRoot) {
    throw new Error('Failed to parse fixture HTML');
  }

  // Normalize HTML by removing extra whitespace and newlines
  const normalizedRendered = rendered.replace(/\s+/g, ' ').trim();
  const normalizedFixture = fixture.html.replace(/\s+/g, ' ').trim();

  // Compare the HTML structure
  expect(compareHtml(normalizedRendered, normalizedFixture)).toBe(true);

  // Get attributes from the HTML parser
  const renderedAttrs = { ...renderedRoot.attributes };
  const fixtureAttrs = { ...fixtureRoot.attributes };

  // Extract class from rawAttrs first
  let renderedClassMatch = null;
  let fixtureClassMatch = null;

  if (renderedRoot.rawAttrs) {
    renderedClassMatch = renderedRoot.rawAttrs.match(/class="([^"]+)"/);
  }
  if (fixtureRoot.rawAttrs) {
    fixtureClassMatch = fixtureRoot.rawAttrs.match(/class="([^"]+)"/);
  }

  if (renderedClassMatch) {
    renderedAttrs.class = renderedClassMatch[1];
  }
  if (fixtureClassMatch) {
    fixtureAttrs.class = fixtureClassMatch[1];
  }

  // If no class in rawAttrs, try classNames property
  if (!renderedAttrs.class && renderedRoot.classNames) {
    renderedAttrs.class = renderedRoot.classNames;
  }
  if (!fixtureAttrs.class && fixtureRoot.classNames) {
    fixtureAttrs.class = fixtureRoot.classNames;
  }

  // If still no class, try to extract from outerHTML
  if (!renderedAttrs.class && renderedRoot.outerHTML) {
    const outerClassMatch = renderedRoot.outerHTML.match(/class="([^"]+)"/);
    if (outerClassMatch) {
      renderedAttrs.class = outerClassMatch[1];
    }
  }
  if (!fixtureAttrs.class && fixtureRoot.outerHTML) {
    const outerClassMatch = fixtureRoot.outerHTML.match(/class="([^"]+)"/);
    if (outerClassMatch) {
      fixtureAttrs.class = outerClassMatch[1];
    }
  }

  // Get all unique attribute keys
  const allAttrKeys = new Set([...Object.keys(renderedAttrs), ...Object.keys(fixtureAttrs)]);

  // Compare each attribute
  for (const key of allAttrKeys) {
    const renderedValue = renderedAttrs[key];
    const fixtureValue = fixtureAttrs[key];

    // Skip undefined attributes in the fixture
    if (fixtureValue === undefined) {
      continue;
    }

    // For type attribute, handle default value
    if (key === 'type' && fixtureValue === 'submit' && renderedValue === undefined) {
      continue;
    }

    // For other attributes, compare values
    if (renderedValue !== fixtureValue) {
      expect(renderedValue).toBe(fixtureValue);
    }
  }

  // Verify classes separately
  const renderedClasses = getClassNames(renderedAttrs.class || '');
  const fixtureClasses = getClassNames(fixtureAttrs.class || '');

  // Check that all fixture classes are present in the rendered element
  for (const className of fixtureClasses) {
    expect(renderedClasses).toContain(className);
  }
}
