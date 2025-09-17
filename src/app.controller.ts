/**
 * Root controller of the NestJS application.
 * Handles the main routes and renders views.
 * This controller manages the application's main routes and view rendering
 * using the Nunjucks template engine.
 *
 * @module AppController
 * @requires @nestjs/common
 */

import { Controller, Get, Render, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Main application controller that handles HTTP requests and view rendering.
 * This controller is decorated with @Controller() to define it as a NestJS controller
 * and is responsible for handling the root routes of the application.
 *
 * @class AppController
 * @description Controller that handles the main application routes and view rendering
 *
 * @example
 * // The controller will be automatically instantiated by NestJS
 * // and registered in the AppModule
 */
@ApiTags('app')
@Controller()
export class AppController {
  /**
   * Handles GET requests to the root route ('/').
   * Renders the index page using the Nunjucks template engine.
   * The @Render decorator specifies which template to use ('index.njk').
   *
   * @method getIndex
   * @returns {Object} View data to be passed to the template
   * @property {string} title - Page title
   * @property {string} message - Welcome message
   *
   * @example
   * // When accessing the root URL, this method will:
   * // 1. Be called by NestJS
   * // 2. Return the view data
   * // 3. Render the index.njk template with the provided data
   */
  @ApiOperation({ summary: 'Get home page' })
  @ApiResponse({
    status: 200,
    description: 'Renders the home page with GOV.UK Frontend template.',
  })
  @Get()
  @Header('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600')
  @Header('Vary', 'Accept-Encoding')
  @Render('index')
  getIndex() {
    return {
      title: 'NestJS GOV.UK Frontend',
      message: 'Welcome to the NestJS GOV.UK Frontend application, this is the homepage of the application with links to all the components from the latest version of GOV.UK Frontend.',
    };
  }
}
