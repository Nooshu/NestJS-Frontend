import { Controller, Get, Render } from '@nestjs/common';

/**
 * Controller for handling view rendering requests.
 * This controller manages all routes that render Nunjucks templates using the GOV.UK Frontend components.
 *
 * @module ViewsController
 * @description Controller for handling view rendering with GOV.UK Frontend
 *
 * @example
 * // Accessing routes
 * GET /views                 // Renders the home page
 * GET /views/second-page     // Renders the second page
 * GET /views/third-page      // Renders the third page
 * GET /views/form-components // Renders form components demo
 */
@Controller()
export class ViewsController {
  /**
   * Renders the home page
   *
   * @method home
   * @returns {Object} Template data with page title
   */
  @Get()
  @Render('index')
  home() {
    return { title: 'Home' };
  }

  /**
   * Renders the second page
   *
   * @method secondPage
   * @returns {Object} Template data with page title
   */
  @Get('second-page')
  @Render('second-page')
  secondPage() {
    return { title: 'Second Page' };
  }

  /**
   * Renders the third page
   *
   * @method thirdPage
   * @returns {Object} Template data with page title
   */
  @Get('third-page')
  @Render('third-page')
  thirdPage() {
    return { title: 'Third Page' };
  }

  /**
   * Renders the form components demo page
   *
   * @method formComponents
   * @returns {Object} Template data with page title
   */
  @Get('form-components')
  @Render('form-components')
  formComponents() {
    return { title: 'Form Components' };
  }

  /**
   * Renders the layout components demo page
   *
   * @method layoutComponents
   * @returns {Object} Template data with page title
   */
  @Get('layout-components')
  @Render('layout-components')
  layoutComponents() {
    return { title: 'Layout Components' };
  }

  /**
   * Renders the feedback components demo page
   *
   * @method feedbackComponents
   * @returns {Object} Template data with page title
   */
  @Get('feedback-components')
  @Render('feedback-components')
  feedbackComponents() {
    return { title: 'Feedback Components' };
  }

  /**
   * Renders the missing components demo page
   *
   * @method missingComponents
   * @returns {Object} Template data with page title
   */
  @Get('missing-components')
  @Render('missing-components')
  missingComponents() {
    return { title: 'Missing Components' };
  }
}
