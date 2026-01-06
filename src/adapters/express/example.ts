import type { NextFunction, Request, Response } from 'express';
import { createExpressApp } from './index';

/**
 * Example usage of the Express.js adapter in a government department's project.
 * This file demonstrates how to use the adapter with minimal configuration.
 */

export const exampleRouteHandler = (_req: Request, res: Response) => {
  res.send('Hello from NestJS with Express!');
};

export const apiDataRouteHandler = (_req: Request, res: Response) => {
  res.json({
    message: 'This is an example API endpoint',
    timestamp: new Date().toISOString(),
  });
};

export const errorRouteHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new Error('This is an example error'));
};

export async function startServer() {
  const port = process.env.PORT || 3000;
  const app = await createExpressApp();

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Example routes
  expressApp.get('/example', exampleRouteHandler);
  expressApp.get('/api/data', apiDataRouteHandler);
  expressApp.get('/error', errorRouteHandler);

  // Start the server
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

export async function runIfMain(
  isMain: boolean = require.main === module,
  startServerFn: () => Promise<void> = startServer
) {
  if (isMain) {
    try {
      await startServerFn();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

runIfMain();
