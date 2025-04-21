import { Express, Request, Response, NextFunction } from 'express';
import winston from 'winston';

/**
 * Sets up logging middleware for the Express.js application.
 * This function configures Winston logger and request logging middleware.
 * 
 * @param {Express} app - The Express.js application instance
 */
export function setupLogger(app: Express) {
  // Create Winston logger
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent')
      });
    });

    next();
  });

  // Error logging middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error occurred', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    next(err);
  });

  // Make logger available in the app
  app.locals.logger = logger;
} 