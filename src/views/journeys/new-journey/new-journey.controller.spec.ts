import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NewJourneyController } from './new-journey.controller';

describe('NewJourneyController', () => {
  let controller: NewJourneyController;
  let configService: ConfigService;

  beforeEach(async () => {
    // Suppress NestJS logger output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewJourneyController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NewJourneyController>(NewJourneyController);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the logger methods to prevent console output
    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(controller['logger'], 'debug').mockImplementation(() => {});
    jest.spyOn(controller['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(controller['logger'], 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have ConfigService injected', () => {
    expect(configService).toBeDefined();
    expect(configService.get).toBeDefined();
  });

  describe('index', () => {
    it('should return the correct view model for the welcome page', () => {
      const result = controller.index();
      
      expect(result).toEqual({
        title: 'New Journey - Welcome',
        journey: 'new-journey',
        currentPage: 'index'
      });
    });
  });

  describe('start', () => {
    it('should return the correct view model for the start page', () => {
      const result = controller.start();
      
      expect(result).toEqual({
        title: 'New Journey - Start',
        journey: 'new-journey',
        currentPage: 'start'
      });
    });
  });

  describe('handleStart', () => {
    it('should store form data and return empty object for redirect', () => {
      const formData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        journeyType: 'personal' as const
      };

      const result = controller.handleStart(formData);
      
      expect(result).toEqual({});
      // Note: We can't directly test the private formData property
      // but we can test the behavior through the details method
    });
  });

  describe('details', () => {
    it('should redirect to start page when no start form data exists', () => {
      const result = controller.details();
      
      expect(result).toEqual({ redirect: '/new-journey/start' });
    });

    it('should return correct view model when start form data exists', () => {
      // First, populate the start form data
      const startFormData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        journeyType: 'personal' as const
      };
      
      // Use the private method to set form data (we'll need to access it)
      (controller as any).formData.start = startFormData;
      
      // Mock the config service
      jest.spyOn(configService, 'get').mockReturnValue('development');
      
      const result = controller.details();
      
      expect(result).toEqual({
        title: 'New Journey - Details',
        journey: 'new-journey',
        currentPage: 'details',
        isDevelopment: true
      });
    });

    it('should return isDevelopment as false when NODE_ENV is not development', () => {
      // First, populate the start form data
      const startFormData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        journeyType: 'personal' as const
      };
      
      (controller as any).formData.start = startFormData;
      
      // Mock the config service to return production
      jest.spyOn(configService, 'get').mockReturnValue('production');
      
      const result = controller.details();
      
      expect(result).toEqual({
        title: 'New Journey - Details',
        journey: 'new-journey',
        currentPage: 'details',
        isDevelopment: false
      });
    });
  });

  describe('handleDetails', () => {
    it('should store form data and return empty object for redirect', () => {
      const formData = {
        'journeyDate-day': '15',
        'journeyDate-month': '6',
        'journeyDate-year': '2024',
        journeyDuration: '2 weeks',
        journeyDescription: 'Business trip to London'
      };

      const result = controller.handleDetails(formData);
      
      expect(result).toEqual({});
    });

    it('should handle error when processing form data', () => {
      const formData = {
        'journeyDate-day': '15',
        'journeyDate-month': '6',
        'journeyDate-year': '2024',
        journeyDuration: '2 weeks',
        journeyDescription: 'Business trip to London'
      };

      const result = controller.handleDetails(formData);
      
      expect(result).toEqual({});
    });

    it('should handle error when an exception occurs during form processing', () => {
      const formData = {
        'journeyDate-day': '15',
        'journeyDate-month': '6',
        'journeyDate-year': '2024',
        journeyDuration: '2 weeks',
        journeyDescription: 'Business trip to London'
      };

      // Mock the formData assignment to throw an error
      const originalFormData = (controller as any).formData;
      (controller as any).formData = {
        get details() {
          throw new Error('Test error');
        },
        set details(value) {
          throw new Error('Test error');
        }
      };

      expect(() => controller.handleDetails(formData)).toThrow('Test error');

      // Restore the original formData
      (controller as any).formData = originalFormData;
    });
  });

  describe('confirmation', () => {
    it('should redirect to index when no start form data exists', () => {
      const result = controller.confirmation();
      
      expect(result).toEqual({ redirect: '/new-journey' });
    });

    it('should redirect to index when no details form data exists', () => {
      // Set only start form data
      (controller as any).formData.start = {
        fullName: 'John Doe',
        email: 'john@example.com',
        journeyType: 'personal' as const
      };
      
      const result = controller.confirmation();
      
      expect(result).toEqual({ redirect: '/new-journey' });
    });

    it('should return correct view model with formatted data when both forms exist', () => {
      // Set both start and details form data
      (controller as any).formData.start = {
        fullName: 'John Doe',
        email: 'john@example.com',
        journeyType: 'business' as const
      };
      
      (controller as any).formData.details = {
        'journeyDate-day': '15',
        'journeyDate-month': '6',
        'journeyDate-year': '2024',
        journeyDuration: '2 weeks',
        journeyDescription: 'Business trip to London'
      };

      const result = controller.confirmation();
      
      expect(result).toEqual({
        title: 'New Journey - Confirmation',
        journey: 'new-journey',
        currentPage: 'confirmation',
        formData: {
          fullName: 'John Doe',
          email: 'john@example.com',
          journeyType: 'business',
          startDate: '15 June 2024',
          duration: '2 weeks',
          description: 'Business trip to London'
        }
      });
    });

    it('should handle date formatting correctly for different months', () => {
      // Set both start and details form data
      (controller as any).formData.start = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        journeyType: 'personal' as const
      };
      
      (controller as any).formData.details = {
        'journeyDate-day': '1',
        'journeyDate-month': '12',
        'journeyDate-year': '2024',
        journeyDuration: '1 month',
        journeyDescription: 'Holiday trip'
      };

      const result = controller.confirmation();
      
      expect(result.formData.startDate).toBe('1 December 2024');
    });

    it('should handle single digit day and month correctly', () => {
      // Set both start and details form data
      (controller as any).formData.start = {
        fullName: 'Bob Wilson',
        email: 'bob@example.com',
        journeyType: 'other' as const
      };
      
      (controller as any).formData.details = {
        'journeyDate-day': '5',
        'journeyDate-month': '3',
        'journeyDate-year': '2024',
        journeyDuration: '3 days',
        journeyDescription: 'Short trip'
      };

      const result = controller.confirmation();
      
      expect(result.formData.startDate).toBe('5 March 2024');
    });

    it('should handle confirmation page rendering correctly', () => {
      // Set both start and details form data
      (controller as any).formData.start = {
        fullName: 'Test User',
        email: 'test@example.com',
        journeyType: 'personal' as const
      };
      
      (controller as any).formData.details = {
        'journeyDate-day': '10',
        'journeyDate-month': '5',
        'journeyDate-year': '2024',
        journeyDuration: '1 week',
        journeyDescription: 'Test journey'
      };

      const result = controller.confirmation();
      
      expect(result.formData.startDate).toBe('10 May 2024');
    });
  });

  describe('form data persistence', () => {
    it('should persist form data between steps', () => {
      // Step 1: Handle start form
      const startFormData = {
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        journeyType: 'business' as const
      };
      
      controller.handleStart(startFormData);
      
      // Step 2: Check details page (should not redirect)
      const detailsResult = controller.details();
      expect(detailsResult).not.toEqual({ redirect: '/new-journey/start' });
      
      // Step 3: Handle details form
      const detailsFormData = {
        'journeyDate-day': '20',
        'journeyDate-month': '7',
        'journeyDate-year': '2024',
        journeyDuration: '1 week',
        journeyDescription: 'Conference attendance'
      };
      
      controller.handleDetails(detailsFormData);
      
      // Step 4: Check confirmation page (should not redirect)
      const confirmationResult = controller.confirmation();
      expect(confirmationResult).not.toEqual({ redirect: '/new-journey' });
      expect(confirmationResult.formData.fullName).toBe('Alice Johnson');
      expect(confirmationResult.formData.startDate).toBe('20 July 2024');
    });
  });

  describe('error handling', () => {
    it('should handle malformed date data gracefully', () => {
      // Set both start and details form data with invalid date
      (controller as any).formData.start = {
        fullName: 'Test User',
        email: 'test@example.com',
        journeyType: 'personal' as const
      };
      
      (controller as any).formData.details = {
        'journeyDate-day': 'invalid',
        'journeyDate-month': 'invalid',
        'journeyDate-year': 'invalid',
        journeyDuration: '1 day',
        journeyDescription: 'Test trip'
      };

      // This should not throw an error but handle the invalid date gracefully
      expect(() => controller.confirmation()).not.toThrow();
    });

    it('should handle edge case where NODE_ENV is undefined', () => {
      // Set start form data
      (controller as any).formData.start = {
        fullName: 'Test User',
        email: 'test@example.com',
        journeyType: 'personal' as const
      };
      
      // Mock the config service to return undefined
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      
      const result = controller.details();
      
      expect(result).toEqual({
        title: 'New Journey - Details',
        journey: 'new-journey',
        currentPage: 'details',
        isDevelopment: false
      });
    });
  });
}); 