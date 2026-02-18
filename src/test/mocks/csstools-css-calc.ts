/**
 * Jest stub for @csstools/css-calc (ESM-only; Jest does not transform it).
 * Used when loading jsdom → cssstyle → @asamuzakjp/css-color → @csstools/css-calc.
 * Provides a passthrough calc() so style parsing does not crash.
 */

export class ParseError extends Error {
  constructor(
    message: string,
    public sourceStart: number,
    public sourceEnd: number
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export const ParseErrorMessage = {} as Record<string, string>;

export class ParseErrorWithComponentValues extends ParseError {
  constructor(
    message: string,
    public componentValues: unknown
  ) {
    super(message, 0, 0);
  }
}

/**
 * Stub: returns the CSS string unchanged so style parsing does not crash.
 * Real implementation would solve calc() expressions.
 */
export function calc(css: string, _options?: Record<string, unknown>): string {
  return css;
}

export function calcFromComponentValues(
  _componentValues: unknown,
  _options?: Record<string, unknown>
): string {
  return '';
}

export const mathFunctionNames = new Set<string>();
