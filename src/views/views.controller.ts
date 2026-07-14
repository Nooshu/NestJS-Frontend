import { Controller, Get, Render } from '@nestjs/common';

/**
 * Controller for handling view rendering requests.
 * This controller manages all routes that render Nunjucks templates using the GOV.UK Frontend components.
 *
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
   * @returns Template data with page title
   */
  @Get()
  @Render('index')
  home() {
    return { title: 'Home' };
  }

  /**
   * Renders the second page
   *
   * @returns Template data with page title
   */
  @Get('second-page')
  @Render('second-page')
  secondPage() {
    return { title: 'Second Page' };
  }

  /**
   * Renders the third page
   *
   * @returns Template data with page title
   */
  @Get('third-page')
  @Render('third-page')
  thirdPage() {
    return { title: 'Third Page' };
  }

  /**
   * Renders the form components demo page
   *
   * @returns Template data with page title
   */
  @Get('form-components')
  @Render('form-components')
  formComponents() {
    return { title: 'Form Components' };
  }

  /**
   * Renders the layout components demo page
   *
   * @returns Template data with page title
   */
  @Get('layout-components')
  @Render('layout-components')
  layoutComponents() {
    return { title: 'Layout Components' };
  }

  /**
   * Renders the feedback components demo page
   *
   * @returns Template data with page title
   */
  @Get('feedback-components')
  @Render('feedback-components')
  feedbackComponents() {
    return { title: 'Feedback Components' };
  }

  /**
   * Renders the missing components demo page
   *
   * @returns Template data with page title
   */
  @Get('missing-components')
  @Render('missing-components')
  missingComponents() {
    return { title: 'Missing Components' };
  }

  /**
   * Renders the performance metrics demo page
   *
   * @returns Template data with page title
   */
  @Get('performance-demo')
  @Render('performance-demo')
  performanceDemo() {
    return { title: 'Performance Metrics Demo' };
  }
}
