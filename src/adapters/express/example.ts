import { createExpressApp } from './index';

/**
 * Example usage of the Express.js adapter in a government department's project.
 * This file demonstrates how to use the adapter with minimal configuration.
 */

// Create the Express.js application
const app = createExpressApp({
  // Add any custom configuration here
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development'
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Example of adding a custom route
app.get('/example', (req, res) => {
  res.render('example', {
    title: 'Example Page',
    serviceName: 'Government Service'
  });
});

// Example of handling API routes
app.get('/api/data', (req, res) => {
  // Example of handling API responses
  res.json({
    data: 'Example API response'
  });
});

// Example of error handling
app.get('/error', (req, res, next) => {
  try {
    throw new Error('Example error');
  } catch (error) {
    next(error);
  }
}); 