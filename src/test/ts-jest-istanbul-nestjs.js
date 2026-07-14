'use strict';

/**
 * Custom Jest transform wrapping ts-jest for NestJS + Istanbul coverage.
 *
 * Why this exists:
 * Nest DI compiles Injectable constructors with TypeScript emitDecoratorMetadata,
 * which emits __metadata("design:paramtypes", ...) helpers. Those helpers often
 * include typeof ternaries that Istanbul maps onto constructor parameter lines.
 * Those branches cannot be covered meaningfully in unit tests, and a single
 * istanbul ignore on the constructor does not suppress them — so 100% branch
 * thresholds fail without ignoring the emitted metadata calls.
 *
 * What it does:
 * 1. Runs ts-jest with removeComments: false so existing istanbul ignore
 *    comments in source survive compilation.
 * 2. Post-processes compiled JS to insert an istanbul ignore next comment
 *    immediately before each design:paramtypes __metadata(...) call.
 * 3. Busts the transform cache key when that post-process logic changes.
 *
 * Test-only — do not use for production builds (wired from jest.config.js).
 */

const tsJest = require('ts-jest');
const { createTransformer } = tsJest.default || tsJest;

const tsJestTransformer = createTransformer({
  tsconfig: {
    removeComments: false,
  },
});

/**
 * Prefixes each design:paramtypes metadata call with istanbul ignore next.
 *
 * @param {string} code - Compiled JavaScript from ts-jest
 * @returns {string} Code with ignore comments inserted
 */
function ignoreDesignParamtypes(code) {
  return code.replace(
    /^([ \t]*)((?:tslib_\d+\.)?__metadata\(\s*["']design:paramtypes["'])/gm,
    '$1/* istanbul ignore next */\n$1$2'
  );
}

module.exports = {
  /**
   * @param {string} sourceText - TypeScript source
   * @param {string} sourcePath - Absolute file path
   * @param {object} options - Jest transform options
   * @returns {string|{code: string}} Transformed code for Jest
   */
  process(sourceText, sourcePath, options) {
    const result = tsJestTransformer.process(sourceText, sourcePath, options);
    if (typeof result === 'string') {
      return ignoreDesignParamtypes(result);
    }
    return {
      ...result,
      code: ignoreDesignParamtypes(result.code),
    };
  },
  /**
   * Cache key includes a version suffix so paramtypes ignore logic invalidates
   * when this wrapper changes.
   *
   * @returns {string}
   */
  getCacheKey(sourceText, sourcePath, options) {
    const base =
      typeof tsJestTransformer.getCacheKey === 'function'
        ? tsJestTransformer.getCacheKey(sourceText, sourcePath, options)
        : `${sourcePath}:${sourceText.length}`;
    return `${base}:ignore-design-paramtypes-v1`;
  },
};
