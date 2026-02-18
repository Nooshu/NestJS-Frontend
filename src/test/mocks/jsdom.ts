/**
 * Minimal jsdom mock for Jest. The real jsdom pulls in ESM-only deps
 * (@csstools/css-calc, @csstools/css-tokenizer) that Jest cannot load.
 * This stub provides document/window so tests and @testing-library/jest-dom work.
 */

function createMockDocument(): Document {
  const doc = {
    createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {}, removeChild: () => {} }),
    createTextNode: (text: string) => ({ nodeValue: text }),
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { appendChild: () => {}, removeChild: () => {}, style: {} },
    head: { appendChild: () => {} },
    documentElement: { style: {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  } as unknown as Document;
  return doc;
}

function JSDOM(_html = ''): { window: Window & { document: Document } } {
  const document = createMockDocument();
  const window = {
    document,
    window: null as unknown as Window,
    location: { href: 'http://localhost', origin: 'http://localhost', pathname: '/', search: '', hash: '' },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    getSelection: () => null,
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    HTMLElement: function () {},
    Element: function () {},
    Node: function () {},
  } as Window & { document: Document };
  window.window = window;
  return { window };
}

export { JSDOM };
