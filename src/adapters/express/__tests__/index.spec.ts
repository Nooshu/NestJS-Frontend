import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import nunjucks from 'nunjucks';
import helmet from 'helmet';
import compression from 'compression';
import { createExpressApp } from '../index';
import { setupErrorHandling } from '../error-handling';
import { setupGovUKFrontend } from '../govuk';
import { setupLogger } from '../logger';
import { setupRoutes } from '../routes';

const mockNestApp = {
  get: jest.fn(),
  enableCors: jest.fn(),
  getHttpAdapter: jest.fn(),
};

const mockExpressApp = {
  set: jest.fn(),
  use: jest.fn(),
};

const mockNunjucksEnv = { addFilter: jest.fn() };

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/platform-express', () => ({
  ExpressAdapter: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../../app.module', () => ({
  AppModule: class AppModule {},
}));

jest.mock('../error-handling', () => ({
  setupErrorHandling: jest.fn(),
}));

jest.mock('../govuk', () => ({
  setupGovUKFrontend: jest.fn(),
}));

jest.mock('../logger', () => ({
  setupLogger: jest.fn(),
}));

jest.mock('../routes', () => ({
  setupRoutes: jest.fn(),
}));

jest.mock('nunjucks', () => ({
  configure: jest.fn(() => mockNunjucksEnv),
}));

jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'));

jest.mock('compression', () =>
  jest.fn((options) => {
    (global as any).__compressionOptions = options;
    return 'compression-middleware';
  })
);

jest.mock('express', () => {
  const expressFn: any = jest.fn();
  expressFn.json = jest.fn(() => 'json-middleware');
  expressFn.urlencoded = jest.fn(() => 'urlencoded-middleware');
  expressFn.static = jest.fn(() => 'static-middleware');
  return expressFn;
});

describe('createExpressApp', () => {
  const securityConfig = {
    cors: {
      enabled: true,
      origin: ['https://example.gov.uk'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockNestApp);
    (nunjucks.configure as jest.Mock).mockReturnValue(mockNunjucksEnv);
    (compression as unknown as jest.Mock).mockImplementation((options) => {
      (global as any).__compressionOptions = options;
      return 'compression-middleware';
    });
    (helmet as unknown as jest.Mock).mockReturnValue('helmet-middleware');
    mockNestApp.get.mockReturnValue(securityConfig);
    mockNestApp.getHttpAdapter.mockReturnValue({
      getInstance: () => mockExpressApp,
    });
    (global as any).__compressionOptions = undefined;
  });

  it('should create and configure the NestJS express application', async () => {
    const app = await createExpressApp();

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockNestApp.enableCors).toHaveBeenCalledWith({
      origin: securityConfig.cors.origin,
      credentials: true,
    });
    expect(mockExpressApp.set).toHaveBeenCalledWith('view engine', 'njk');
    expect(mockExpressApp.set).toHaveBeenCalledWith('views', expect.stringContaining('views'));
    expect(nunjucks.configure).toHaveBeenCalled();
    expect(helmet).toHaveBeenCalled();
    expect(compression).toHaveBeenCalled();
    expect(setupLogger).toHaveBeenCalledWith(mockExpressApp);
    expect(setupGovUKFrontend).toHaveBeenCalledWith(mockExpressApp, mockNunjucksEnv);
    expect(setupRoutes).toHaveBeenCalledWith(mockExpressApp);
    expect(setupErrorHandling).toHaveBeenCalledWith(mockExpressApp);
    expect(app).toBe(mockNestApp);
  });

  it('should skip enableCors when cors is disabled', async () => {
    mockNestApp.get.mockReturnValue({ cors: { enabled: false, origin: true } });
    await createExpressApp();
    expect(mockNestApp.enableCors).not.toHaveBeenCalled();
  });

  describe('compression filter', () => {
    let filter: (req: Request, res: Response) => boolean;

    beforeEach(async () => {
      await createExpressApp();
      filter = (global as any).__compressionOptions.filter;
    });

    const makeReq = (path: string, headers: Record<string, string> = {}) =>
      ({ path, headers }) as unknown as Request;

    const makeRes = (contentType?: string) =>
      ({
        getHeader: jest.fn().mockReturnValue(contentType),
      }) as unknown as Response;

    it('should skip compression when x-no-compression is set', () => {
      expect(filter(makeReq('/page', { 'x-no-compression': '1' }), makeRes())).toBe(false);
    });

    it('should skip compression for binary extensions', () => {
      const extensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.svg',
        '.ico',
        '.webp',
        '.avif',
        '.bmp',
        '.tiff',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
        '.otf',
        '.mp4',
        '.mp3',
        '.wav',
        '.avi',
        '.mov',
        '.pdf',
        '.zip',
        '.gz',
        '.tar',
        '.rar',
        '.7z',
      ];

      extensions.forEach((ext) => {
        expect(filter(makeReq(`/assets/file${ext}`), makeRes())).toBe(false);
      });
    });

    it('should skip compression for binary mime types', () => {
      const mimeTypes = [
        'image/png',
        'video/mp4',
        'audio/mpeg',
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'font/woff2',
        'application/font-woff',
        'application/font-woff2',
      ];

      mimeTypes.forEach((mime) => {
        expect(filter(makeReq('/download'), makeRes(mime))).toBe(false);
      });
    });

    it('should allow compression for text responses', () => {
      expect(filter(makeReq('/page.html'), makeRes('text/html'))).toBe(true);
    });

    it('should allow compression when content-type is missing', () => {
      expect(filter(makeReq('/api/data'), makeRes(undefined))).toBe(true);
    });
  });
});
