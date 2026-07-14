import { Test, TestingModule } from '@nestjs/testing';
import { CspReportController } from './csp-report.controller';
import { LoggerService } from '../../logger/logger.service';

describe('CspReportController', () => {
  let controller: CspReportController;
  let mockLogger: {
    warn: jest.Mock;
  };

  beforeEach(async () => {
    mockLogger = {
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CspReportController],
      providers: [
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<CspReportController>(CspReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should also construct with an injected logger', () => {
    const direct = new CspReportController(mockLogger as unknown as LoggerService);
    expect(direct).toBeInstanceOf(CspReportController);
  });

  it('should cover decorator metadata fallback when LoggerService is not a function', () => {
    jest.isolateModules(() => {
      jest.doMock('../../logger/logger.service', () => ({
        LoggerService: { notAConstructor: true },
      }));

      const { CspReportController: Reloaded } = require('./csp-report.controller');
      expect(Reloaded).toBeDefined();
    });
  });

  it('should log the CSP violation and return received status', async () => {
    const report = {
      'csp-report': {
        'document-uri': 'https://example.com',
        'violated-directive': 'script-src',
      },
    };

    const result = await controller.handleCspViolation(report);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'CSP Violation Report',
      expect.objectContaining({
        'csp-report': report,
        timestamp: expect.any(String),
      })
    );
    expect(result).toEqual({ status: 'received' });
  });
});
