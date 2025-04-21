import { Express, Request, Response, NextFunction } from 'express';

/**
 * Sets up error handling middleware for the Express.js application.
 * This function configures error handling similar to NestJS's exception filters.
 * 
 * @param {Express} app - The Express.js application instance
 */
export function setupErrorHandling(app: Express) {
  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).render('error', {
      title: 'Page not found',
      error: {
        status: 404,
        message: 'Page not found'
      }
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    // Check if it's a security-related error
    if (err.name === 'SecurityError') {
      return res.status(403).render('error', {
        title: 'Security Error',
        error: {
          status: 403,
          message: 'Access denied'
        }
      });
    }

    // Default error response
    res.status(500).render('error', {
      title: 'Internal Server Error',
      error: {
        status: 500,
        message: 'Something went wrong'
      }
    });
  });
} 