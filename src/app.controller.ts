/**
 * Root controller of the NestJS application.
 * Handles the main routes and renders views.
 * 
 * @module AppController
 */

import { Controller, Get, Render } from '@nestjs/common';

/**
 * @class AppController
 * @description Controller that handles the main application routes
 */
@Controller()
export class AppController {
  /**
   * Renders the index page.
   * 
   * @method getIndex
   * @returns {Object} View data for the index template
   */
  @Get()
  @Render('index')
  getIndex() {
    return {
      title: 'NestJS GOV.UK Frontend',
      message: 'Welcome to the NestJS GOV.UK Frontend application'
    };
  }
} 