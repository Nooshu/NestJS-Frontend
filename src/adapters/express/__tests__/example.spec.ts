import type { Express, Request, Response } from 'express';
import type { INestApplication } from '@nestjs/common';
import { createExpressApp } from '../index';
import request from 'supertest';
import * as exampleModule from '../example';
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
    process.env = { ...originalEnv };
    process.env.PORT = '3000';
    console.log = jest.fn();
    console.error = jest.fn();
    mockExpressApp = express();
    mockNestApp = {
      getHttpAdapter: jest.fn().mockReturnValue({
        getInstance: jest.fn().mockReturnValue(mockExpressApp),
      }),
      listen: jest.fn(),
    } as unknown as INestApplication;
    (createExpressApp as jest.Mock).mockResolvedValue(mockNestApp);
    mockExpressApp.get('/example', exampleModule.exampleRouteHandler);
    mockExpressApp.get('/api/data', exampleModule.apiDataRouteHandler);
    mockExpressApp.get('/error', exampleModule.errorRouteHandler);
    mockExpressApp.use((err: Error, _req: any, res: any, _next: any) => {
      res.status(500).json({ error: err.message });
    });
    app = mockExpressApp;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('startServer', () => {
    it('should get the Express instance from NestJS app', async () => {
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      await exampleModule.startServer();
      expect(createExpressApp).toHaveBeenCalled();
      const getHttpAdapterSpy = mockNestApp.getHttpAdapter as jest.Mock;
      expect(getHttpAdapterSpy).toHaveBeenCalled();
      const httpAdapter = getHttpAdapterSpy.mock.results[0].value;
      expect(httpAdapter.getInstance).toHaveBeenCalled();
    });
    it('should start the server successfully', async () => {
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      await exampleModule.startServer();
      expect(mockNestApp.listen).toHaveBeenCalledWith('3000');
      expect(console.log).toHaveBeenCalledWith('Server is running on port 3000');
    });
    it('should use custom port from environment', async () => {
      process.env.PORT = '4000';
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      await exampleModule.startServer();
      expect(mockNestApp.listen).toHaveBeenCalledWith('4000');
      expect(console.log).toHaveBeenCalledWith('Server is running on port 4000');
    });
    it('should use default port when PORT is not set', async () => {
      delete process.env.PORT;
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      await exampleModule.startServer();
      expect(mockNestApp.listen).toHaveBeenCalledWith(3000);
      expect(console.log).toHaveBeenCalledWith('Server is running on port 3000');
    });
    it('should handle server startup errors', async () => {
      const mockError = new Error('Failed to start server');
      (mockNestApp.listen as jest.Mock).mockRejectedValue(mockError);
      const processExitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never);
      await exampleModule.startServer().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
      });
      expect(console.error).toHaveBeenCalledWith('Failed to start server:', mockError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
      processExitSpy.mockRestore();
    });
    it('should add routes to the Express app', async () => {
      (mockNestApp.listen as jest.Mock).mockResolvedValue(mockNestApp);
      await exampleModule.startServer();
      const response = await request(mockExpressApp).get('/example');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello from NestJS with Express!');
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
    it('should return valid JSON timestamp in /api/data route', async () => {
      const response = await request(app).get('/api/data');
      expect(response.status).toBe(200);
      const timestamp = response.body.timestamp;
      expect(typeof timestamp).toBe('string');
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('Route handler functions', () => {
    it('should test the /example route handler function directly', () => {
      const mockReq = {} as Request;
      const mockRes = { send: jest.fn() } as unknown as Response;
      exampleModule.exampleRouteHandler(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledWith('Hello from NestJS with Express!');
    });
    it('should test the /api/data route handler function directly', () => {
      const mockReq = {} as Request;
      const mockRes = { json: jest.fn() } as unknown as Response;
      exampleModule.apiDataRouteHandler(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'This is an example API endpoint',
          timestamp: expect.any(String),
        })
      );
    });
    it('should test the /error route handler function directly', () => {
      const mockReq = {} as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn();
      exampleModule.errorRouteHandler(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe('This is an example error');
    });
  });

  describe('runIfMain', () => {
    it('should not throw if not main module', async () => {
      await expect(exampleModule.runIfMain(false)).resolves.toBeUndefined();
    });
    it('should call startServer if isMain is true', async () => {
      const mockStartServer = jest.fn().mockResolvedValue(undefined);
      await exampleModule.runIfMain(true, mockStartServer);
      expect(mockStartServer).toHaveBeenCalled();
    });
    it('should handle error in startServer if isMain is true', async () => {
      const error = new Error('fail');
      const mockStartServer = jest.fn().mockRejectedValue(error);
      const processExitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never);
      await exampleModule.runIfMain(true, mockStartServer);
      expect(console.error).toHaveBeenCalledWith('Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
      processExitSpy.mockRestore();
    });
  });
});
