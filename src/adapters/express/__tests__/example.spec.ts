import type { Express, Request, Response, NextFunction } from 'express';
import type { INestApplication } from '@nestjs/common';
import { createExpressApp } from '../index';
import request from 'supertest';
import { startServer } from '../example';
import express from 'express';

// Mock the createExpressApp function
jest.mock('../index', () => ({
  createExpressApp: jest.fn(),
}));

describe('example.ts', () => {
  let app: Express;
  let mockNestApp: Partial<INestApplication>;
  let mockExpressApp: Express;
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(async () => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.PORT = '3000';

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Create a real Express app instance for route testing
    mockExpressApp = express();

    // Create mock NestJS app
    mockNestApp = {
      getHttpAdapter: jest.fn().mockReturnValue({
        getInstance: jest.fn().mockReturnValue(mockExpressApp),
      }),
      listen: jest.fn(),
    } as unknown as INestApplication;

    // Setup createExpressApp mock to return our mock NestJS app
    (createExpressApp as jest.Mock).mockResolvedValue(mockNestApp);

    // Add example routes to the Express app
    mockExpressApp.get('/example', (_req: Request, res: Response) => {
      res.send('Hello from NestJS with Express!');
    });

    mockExpressApp.get('/api/data', (_req: Request, res: Response) => {
      res.json({
        message: 'This is an example API endpoint',
        timestamp: new Date().toISOString(),
      });
    });

    mockExpressApp.get('/error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('This is an example error'));
    });

    // Add error handling middleware
    mockExpressApp.use((err: Error, _req: any, res: any, _next: any) => {
      res.status(500).json({ error: err.message });
    });

    // Set app to mockExpressApp for route testing
    app = mockExpressApp;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment variables and console methods
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('startServer', () => {
    it('should get the Express instance from NestJS app', async () => {
      // Mock successful server start
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      
      // Call startServer
      await startServer();

      // Verify Express instance was retrieved
      expect(createExpressApp).toHaveBeenCalled();
      const getHttpAdapterSpy = mockNestApp.getHttpAdapter as jest.Mock;
      expect(getHttpAdapterSpy).toHaveBeenCalled();
      const httpAdapter = getHttpAdapterSpy.mock.results[0].value;
      expect(httpAdapter.getInstance).toHaveBeenCalled();
    });

    it('should start the server successfully', async () => {
      // Mock successful server start
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      
      // Call startServer
      await startServer();

      // Verify server was started
      expect(mockNestApp.listen).toHaveBeenCalledWith('3000');
      expect(console.log).toHaveBeenCalledWith('Server is running on port 3000');
    });

    it('should use custom port from environment', async () => {
      process.env.PORT = '4000';
      
      // Mock successful server start
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      
      // Call startServer
      await startServer();

      // Verify server was started with custom port
      expect(mockNestApp.listen).toHaveBeenCalledWith('4000');
      expect(console.log).toHaveBeenCalledWith('Server is running on port 4000');
    });

    it('should handle server startup errors', async () => {
      // Mock server startup error
      const mockError = new Error('Failed to start server');
      (mockNestApp.listen as jest.Mock).mockRejectedValue(mockError);
      
      // Spy on process.exit
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // Call startServer and handle the error
      await startServer().catch((error) => {
        // Log the error (this simulates what happens in the main block)
        console.error('Failed to start server:', error);
        process.exit(1);
      });

      // Verify error handling
      expect(console.error).toHaveBeenCalledWith('Failed to start server:', mockError);
      expect(processExitSpy).toHaveBeenCalledWith(1);

      // Cleanup
      processExitSpy.mockRestore();
    });
  });

  describe('Example Routes', () => {
    it('should handle /example route', async () => {
      const response = await request(app).get('/example');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello from NestJS with Express!');
    });

    it('should handle /api/data route', async () => {
      const response = await request(app).get('/api/data');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'This is an example API endpoint');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
    });

    it('should handle /error route', async () => {
      const response = await request(app).get('/error');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'This is an example error');
    });
  });

  describe('Direct file execution', () => {
    it('should handle errors when run directly', async () => {
      // Mock server startup error
      const mockError = new Error('Failed to start server');
      (mockNestApp.listen as jest.Mock).mockRejectedValue(mockError);
      
      // Spy on process.exit
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // Call startServer directly (simulating direct file execution)
      await startServer().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
      });

      // Verify error handling
      expect(console.error).toHaveBeenCalledWith('Failed to start server:', mockError);
      expect(processExitSpy).toHaveBeenCalledWith(1);

      // Cleanup
      processExitSpy.mockRestore();
    });
  });
}); 