/**
 * Runs before any other setup so global.document and global.window exist
 * when modules (e.g. axios) are loaded. Uses our jsdom mock to avoid
 * pulling in the real jsdom and its ESM-only dependencies.
 */
const globalAny = globalThis as any;

if (typeof globalAny.document === 'undefined') {
  const { JSDOM } = require('@test/mocks/jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  globalAny.document = dom.window.document;
  globalAny.window = dom.window;
}
