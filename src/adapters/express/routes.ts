import type { Express } from 'express';

/**
 * Sets up the routes for the Express.js application.
 * This function configures all the routes that would normally be handled by NestJS controllers.
 *
 * @param {Express} app - The Express.js application instance
 */
export function setupRoutes(app: Express) {
  // Note: Root route (/) is handled by NestJS AppController
  // This function is kept for future Express-specific routes if needed

  // Suppress unused parameter warning since this function is called but currently empty
  void app;

  // Add more routes here
  // Example:
  // app.get('/example', (req, res) => {
  //   res.render('example', { title: 'Example Page' });
  // });

  // Setup API routes if needed
  // app.use('/api', apiRouter);
}
