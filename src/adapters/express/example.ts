import type { NextFunction, Request, Response } from 'express';
import { createExpressApp } from './index';

/**
 * Example usage of the Express.js adapter in a government department's project.
 * This file demonstrates how to use the adapter with minimal configuration.
 */

async function startServer() {
  const port = process.env.PORT || 3000;
  const app = await createExpressApp();

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Example routes
  expressApp.get('/example', (_req: Request, res: Response) => {
    res.send('Hello from NestJS with Express!');
  });

  expressApp.get('/api/data', (_req: Request, res: Response) => {
    res.json({
      message: 'This is an example API endpoint',
      timestamp: new Date().toISOString(),
    });
  });

  expressApp.get('/error', (_req: Request, _res: Response, next: NextFunction) => {
    next(new Error('This is an example error'));
  });

  // Start the server
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
