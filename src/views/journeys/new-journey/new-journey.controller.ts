import { Controller, Get, Post, Body, Render, Redirect, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface StartFormData {
  fullName: string;
  email: string;
  journeyType: 'personal' | 'business' | 'other';
}

interface DetailsFormData {
  'journey-date-day': string;
  'journey-date-month': string;
  'journey-date-year': string;
  journeyDuration: string;
  journeyDescription: string;
}

@Controller('new-journey')
export class NewJourneyController {
  private readonly logger = new Logger(NewJourneyController.name);

  constructor(private readonly configService: ConfigService) {}

  private formData: {
    start?: StartFormData;
    details?: DetailsFormData;
  } = {};

  @Get()
  @Render('journeys/new-journey/index')
  index() {
    return {
      title: 'New Journey - Welcome',
      journey: 'new-journey',
      currentPage: 'index'
    };
  }

  @Get('start')
  @Render('journeys/new-journey/start')
  start() {
    return {
      title: 'New Journey - Start',
      journey: 'new-journey',
      currentPage: 'start'
    };
  }

  @Post('start')
  @Redirect('/new-journey/details')
  handleStart(@Body() formData: StartFormData) {
    this.formData.start = formData;
    return {};
  }

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

  @Get('confirmation')
  @Render('journeys/new-journey/confirmation')
  confirmation() {
    if (!this.formData.start || !this.formData.details) {
      return { redirect: '/new-journey' };
    }

    const { start, details } = this.formData;
    const startDate = new Date(
      parseInt(details['journey-date-year']),
      parseInt(details['journey-date-month']) - 1,
      parseInt(details['journey-date-day'])
    );

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