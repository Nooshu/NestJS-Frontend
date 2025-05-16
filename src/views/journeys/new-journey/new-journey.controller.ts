/**
 * Controller responsible for handling the new journey user flow.
 * This controller manages the multi-step journey process including:
 * - Initial welcome page
 * - Journey start form (collecting user details)
 * - Journey details form (collecting journey specifics)
 * - Confirmation page
 * 
 * The journey follows a sequential flow with data persistence between steps.
 * @class NewJourneyController
 */

import { Controller, Get, Post, Body, Render, Redirect, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Interface representing the data collected in the journey start form.
 * @interface StartFormData
 */
interface StartFormData {
  /** User's full name */
  fullName: string;
  /** User's email address */
  email: string;
  /** Type of journey being undertaken */
  journeyType: 'personal' | 'business' | 'other';
}

/**
 * Interface representing the data collected in the journey details form.
 * @interface DetailsFormData
 */
interface DetailsFormData {
  /** Day component of the journey start date */
  'journeyDate-day': string;
  /** Month component of the journey start date */
  'journeyDate-month': string;
  /** Year component of the journey start date */
  'journeyDate-year': string;
  /** Duration of the journey */
  journeyDuration: string;
  /** Detailed description of the journey */
  journeyDescription: string;
}

@Controller('new-journey')
export class NewJourneyController {
  private readonly logger = new Logger(NewJourneyController.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * In-memory storage for form data between journey steps.
   * Note: In a production environment, this should be replaced with a proper database.
   */
  private formData: {
    start?: StartFormData;
    details?: DetailsFormData;
  } = {};

  /**
   * Renders the welcome page for the new journey.
   * @returns {Object} View model containing page title and navigation data
   */
  @Get()
  @Render('journeys/new-journey/index')
  index() {
    return {
      title: 'New Journey - Welcome',
      journey: 'new-journey',
      currentPage: 'index'
    };
  }

  /**
   * Renders the journey start form page.
   * @returns {Object} View model containing page title and navigation data
   */
  @Get('start')
  @Render('journeys/new-journey/start')
  start() {
    return {
      title: 'New Journey - Start',
      journey: 'new-journey',
      currentPage: 'start'
    };
  }

  /**
   * Handles the submission of the journey start form.
   * Stores the form data and redirects to the details page.
   * @param {StartFormData} formData - The submitted form data
   * @returns {Object} Empty object (redirect handled by decorator)
   */
  @Post('start')
  @Redirect('/new-journey/details')
  handleStart(@Body() formData: StartFormData) {
    this.formData.start = formData;
    return {};
  }

  /**
   * Renders the journey details form page.
   * Redirects to start page if no start form data exists.
   * @returns {Object} View model containing page title, navigation data, and environment info
   */
  @Get('details')
  @Render('journeys/new-journey/details')
  details() {
    if (!this.formData.start) {
      return { redirect: '/new-journey/start' };
    }
    return {
      title: 'New Journey - Details',
      journey: 'new-journey',
      currentPage: 'details',
      isDevelopment: this.configService.get<string>('NODE_ENV') === 'development'
    };
  }

  /**
   * Handles the submission of the journey details form.
   * Stores the form data and redirects to the confirmation page.
   * Includes detailed logging for debugging purposes.
   * @param {DetailsFormData} formData - The submitted form data
   * @returns {Object} Empty object (redirect handled by decorator)
   * @throws {Error} If there's an error processing the form data
   */
  @Post('details')
  @Redirect('/new-journey/confirmation')
  handleDetails(@Body() formData: DetailsFormData) {
    this.logger.debug('Received details form submission:', {
      formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      }
    });

    try {
      this.formData.details = formData;
      this.logger.debug('Form data processed successfully');
      return {};
    } catch (error) {
      this.logger.error('Error processing form data:', error);
      throw error;
    }
  }

  /**
   * Renders the journey confirmation page.
   * Shows a summary of all collected journey information.
   * Redirects to start if required form data is missing.
   * @returns {Object} View model containing page title, navigation data, and formatted journey details
   */
  @Get('confirmation')
  @Render('journeys/new-journey/confirmation')
  confirmation() {
    if (!this.formData.start || !this.formData.details) {
      return { redirect: '/new-journey' };
    }

    const { start, details } = this.formData;
    const startDate = new Date(
      parseInt(details['journeyDate-year']),
      parseInt(details['journeyDate-month']) - 1,
      parseInt(details['journeyDate-day'])
    );

    this.logger.debug('Rendering confirmation page:', {
      startDate,
      rawDate: {
        year: details['journeyDate-year'],
        month: details['journeyDate-month'],
        day: details['journeyDate-day']
      }
    });

    return {
      title: 'New Journey - Confirmation',
      journey: 'new-journey',
      currentPage: 'confirmation',
      formData: {
        fullName: start.fullName,
        email: start.email,
        journeyType: start.journeyType,
        startDate: startDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        duration: details.journeyDuration,
        description: details.journeyDescription
      }
    };
  }
} 