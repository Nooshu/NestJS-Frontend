import { setupLogger } from '../logger';
import winston from 'winston';

describe('setupLogger', () => {
  let app: any;
  let useMock: jest.Mock;
  let locals: any;
  let loggerMock: any;

  beforeEach(() => {
    useMock = jest.fn();
    locals = {};
    app = { use: useMock, locals };

    loggerMock = {
      info: jest.fn(),
      error: jest.fn(),
    };

    jest.spyOn(winston, 'createLogger').mockReturnValue(loggerMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should attach logger to app.locals', () => {
    setupLogger(app);
    expect(app.locals.logger).toBe(loggerMock);
  });

  it('should add request logging middleware', () => {
    setupLogger(app);
    // The first middleware added is the request logger
    const middleware = useMock.mock.calls[0][0];
    const req = { method: 'GET', url: '/test', get: jest.fn().mockReturnValue('agent') };
    const res: any = { statusCode: 200, on: jest.fn((event, cb) => { if (event === 'finish') cb(); }) };
    const next = jest.fn();

    middleware(req, res, next);
    expect(loggerMock.info).toHaveBeenCalledWith('HTTP request', expect.objectContaining({
      method: 'GET',
      url: '/test',
      status: 200,
      userAgent: 'agent',
    }));
    expect(next).toHaveBeenCalled();
  });

  it('should add error logging middleware', () => {
    setupLogger(app);
    // The second middleware added is the error logger
    const errorMiddleware = useMock.mock.calls[1][0];
    const err = new Error('fail');
    const req = { url: '/fail', method: 'POST' };
    const res = {};
    const next = jest.fn();

    errorMiddleware(err, req, res, next);
    expect(loggerMock.error).toHaveBeenCalledWith('Error occurred', expect.objectContaining({
      error: 'fail',
      url: '/fail',
      method: 'POST',
    }));
    expect(next).toHaveBeenCalledWith(err);
  });

  it('should not call logger.info if event is not finish', () => {
    setupLogger(app);
    const middleware = useMock.mock.calls[0][0];
    const req = { method: 'POST', url: '/branch', get: jest.fn() };
    // Simulate res.on with a non-finish event
    const res: any = { statusCode: 201, on: jest.fn((event, cb) => { if (event === 'not-finish') cb(); }) };
    const next = jest.fn();

    middleware(req, res, next);
    // logger.info should not be called because 'finish' event did not fire
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should not call logger.info if res.on never calls the callback', () => {
    setupLogger(app);
    const middleware = useMock.mock.calls[0][0];
    const req = { method: 'POST', url: '/branch', get: jest.fn() };
    // Simulate res.on never calling the callback
    const res: any = { statusCode: 201, on: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    // logger.info should not be called because callback was never called
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
}); 