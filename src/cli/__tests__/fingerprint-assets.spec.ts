import { FingerprintService } from '../../shared/services/fingerprint.service';
import { main } from '../fingerprint-assets';

// Mock the FingerprintService
jest.mock('../../shared/services/fingerprint.service');

// Mock console.log and console.error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let consoleOutput: string[] = [];

describe('fingerprint-assets.ts CLI script', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset console output
    consoleOutput = [];
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    console.error = jest.fn((...args) => {
      consoleOutput.push(`ERROR: ${args.join(' ')}`);
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should create a FingerprintService instance and call fingerprint()', async () => {
    // Arrange
    const mockFingerprint = jest.fn();
    (FingerprintService as jest.Mock).mockImplementation(() => ({
      fingerprint: mockFingerprint,
    }));

    // Act
    await main();

    // Assert
    expect(FingerprintService).toHaveBeenCalledTimes(1);
    expect(mockFingerprint).toHaveBeenCalledTimes(1);
  });

  it('should log start and completion messages', async () => {
    // Arrange
    const mockFingerprint = jest.fn();
    (FingerprintService as jest.Mock).mockImplementation(() => ({
      fingerprint: mockFingerprint,
    }));

    // Act
    await main();

    // Assert
    expect(consoleOutput).toContain('Starting asset fingerprinting...');
    expect(consoleOutput).toContain('Asset fingerprinting completed.');
  });

  it('should handle errors from FingerprintService', async () => {
    // Arrange
    const mockError = new Error('Fingerprinting failed');
    const mockFingerprint = jest.fn().mockRejectedValue(mockError);
    (FingerprintService as jest.Mock).mockImplementation(() => ({
      fingerprint: mockFingerprint,
    }));

    // Mock process.exit to prevent test from actually exiting
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    // Act
    await main();

    // Assert
    expect(consoleOutput).toContain('ERROR: Asset fingerprinting failed: Fingerprinting failed');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
