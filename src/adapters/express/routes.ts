import type { Express } from 'express';

/**
 * Sets up the routes for the Express.js application.
 * This function configures all the routes that would normally be handled by NestJS controllers.
 *
 * @param {Express} app - The Express.js application instance
 */
export function setupRoutes(app: Express) {
  // Example route setup - this should be expanded based on your actual routes
  app.get('/', (_req, res) => {
    res.render('index', {
      title: 'GOV.UK Frontend with Express.js',
      serviceName: 'Example Service',
    });
  });

  // Add more routes here
  // Example:
  // app.get('/example', (req, res) => {
  //   res.render('example', { title: 'Example Page' });
  // });

  // Setup API routes if needed
  // app.use('/api', apiRouter);
}
