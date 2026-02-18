/**
 * Runs before any other setup so global.document and global.window exist
 * when modules (e.g. axios) are loaded. Uses our jsdom mock to avoid
 * pulling in the real jsdom and its ESM-only dependencies.
 */
if (typeof globalThis.document === 'undefined') {
  const { JSDOM } = require('@test/mocks/jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
}
