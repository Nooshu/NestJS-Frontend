import type { Express, Request, Response } from 'express';
import { setupRoutes } from '../routes';

describe('routes.ts', () => {
  let mockApp: Partial<Express>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Mock Express app
    mockApp = {
      get: jest.fn(),
    };

    // Mock request
    mockReq = {};

    // Mock response
    mockRes = {
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupRoutes', () => {
    it('should call app.get to set up the root route', () => {
      // This will cover line 9 (function execution) and line 11 (app.get call)
      setupRoutes(mockApp as Express);

      expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
    });

    it('should render index template with correct data when root route is accessed', () => {
      // Set up the route
      setupRoutes(mockApp as Express);

      // Get the route handler that was registered
      const routeHandler = (mockApp.get as jest.Mock).mock.calls[0][1];

      // Call the route handler - this will cover line 12 and the res.render call
      routeHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.render).toHaveBeenCalledWith('index', {
        title: 'GOV.UK Frontend with Express.js',
        serviceName: 'Example Service',
      });
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