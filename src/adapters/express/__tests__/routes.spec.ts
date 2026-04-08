import type { Express } from 'express';
import { setupRoutes } from '../routes';

describe('routes.ts', () => {
  let mockApp: Partial<Express>;

  beforeEach(() => {
    // Mock Express app
    mockApp = {
      get: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupRoutes', () => {
    it('should not set up the root route (handled by NestJS)', () => {
      // This will cover line 9 (function execution) but should not call app.get for root route
      setupRoutes(mockApp as Express);

      // Should not call app.get for root route since it's handled by NestJS AppController
      expect(mockApp.get).not.toHaveBeenCalledWith('/', expect.any(Function));
    });

    it('should accept Express app as parameter', () => {
      // This ensures the function signature is correct and covers line 9
      expect(() => setupRoutes(mockApp as Express)).not.toThrow();
    });

    it('should be defined', () => {
      expect(setupRoutes).toBeDefined();
      expect(typeof setupRoutes).toBe('function');
    });
  });
});
