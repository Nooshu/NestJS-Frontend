/* Mock nunjucks so that nunjucks.configure is a mock function */
jest.mock('nunjucks', () => ({
  configure: jest.fn(() => ({ render: jest.fn() })),
}));

import * as nunjucks from 'nunjucks';
import { createNunjucksEngine } from './nunjucks.engine';

describe('createNunjucksEngine', () => {
  let renderMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    (nunjucks.configure as jest.Mock).mockReturnValue({ render: renderMock });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a function', () => {
    const engine = createNunjucksEngine();
    expect(typeof engine).toBe('function');
  });

  it('should call env.render with correct arguments and handle success', (done) => {
    const engine = createNunjucksEngine();
    const filePath = 'template.njk';
    const options = { foo: 'bar' };
    const rendered = '<p>bar</p>';

    renderMock.mockImplementation((fp, opts, cb) => {
      expect(fp).toBe(filePath);
      expect(opts).toBe(options);
      cb(null, rendered);
    });

    engine(filePath, options, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe(rendered);
      done();
    });
  });

  it('should call env.render and handle error', (done) => {
    const engine = createNunjucksEngine();
    const filePath = 'template.njk';
    const options = { foo: 'bar' };
    const error = new Error('Render failed');

    renderMock.mockImplementation((fp, opts, cb) => {
      expect(fp).toBe(filePath);
      expect(opts).toBe(options);
      cb(error);
    });

    engine(filePath, options, (err, result) => {
      expect(err).toBe(error);
      expect(result).toBeUndefined();
      done();
    });
  });
});
