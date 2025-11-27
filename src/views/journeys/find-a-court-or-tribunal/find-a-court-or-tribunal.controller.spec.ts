import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { FindCourtTribunalController } from './find-a-court-or-tribunal.controller';
import { courtsData } from './dto/courtData';

describe('FindCourtTribunalController', () => {
  let controller: FindCourtTribunalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindCourtTribunalController],
    }).compile();

    controller = module.get<FindCourtTribunalController>(FindCourtTribunalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return the correct view data for the index page', () => {
      const result = controller.index();
      
      expect(result).toEqual({
        title: 'Find a Court or Tribunal',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'index',
      });
    });

    it('should have the correct method signature', () => {
      expect(typeof controller.index).toBe('function');
    });
  });

  describe('options', () => {
    it('should return the correct view data for the options page', () => {
      const result = controller.options();
      
      expect(result).toEqual({
        title: 'Find a Court or Tribunal - Select Option',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'options',
        csrfToken: '',
      });
    });

    it('should have the correct method signature', () => {
      expect(typeof controller.options).toBe('function');
    });
  });

  describe('handleOptions', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          csrfToken: ''
        }
      };
    });

    it('should render error page when no option is selected', () => {
      const body = {};
      
      controller.handleOptions(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/options', {
        title: 'Find a Court or Tribunal - Select Option',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'options',
        csrfToken: '',
        errors: {
          courtOption: {
            text: 'Select whether you know the name of the court or tribunal'
          }
        },
        errorSummary: [
          {
            text: 'Select whether you know the name of the court or tribunal',
            href: '#courtOption'
          }
        ],
        formData: body
      });
    });

    it('should redirect to court-search with hasName=true when option1 is selected', () => {
      const body = { courtOption: 'option1' };
      
      controller.handleOptions(body, mockResponse as Response);
      
      expect(mockResponse.redirect).toHaveBeenCalledWith('/find-a-court-or-tribunal/court-search?hasName=true');
    });

    it('should redirect to court-search with hasName=false when option2 is selected', () => {
      const body = { courtOption: 'option2' };
      
      controller.handleOptions(body, mockResponse as Response);
      
      expect(mockResponse.redirect).toHaveBeenCalledWith('/find-a-court-or-tribunal/court-search?hasName=false');
    });

    it('should redirect to court-search as fallback for invalid options', () => {
      const body = { courtOption: 'invalid-option' };
      
      controller.handleOptions(body, mockResponse as Response);
      
      expect(mockResponse.redirect).toHaveBeenCalledWith('/find-a-court-or-tribunal/court-search');
    });
  });

  describe('courtSearch', () => {
    it('should return the correct view data with courts for the court search page', () => {
      const result = controller.courtSearch();
      
      expect(result).toEqual({
        title: 'Find a Court or Tribunal - Court Search',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-search',
        courts: Object.values(courtsData),
        csrfToken: '',
      });
    });

    it('should include all courts from the courtsData', () => {
      const result = controller.courtSearch();
      
      expect(result.courts).toHaveLength(Object.keys(courtsData).length);
      expect(result.courts).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'manchester-crown',
          name: 'Manchester Crown Court (Minshull St)',
        }),
        expect.objectContaining({
          id: 'birmingham-crown',
          name: 'Birmingham Crown Court',
        }),
        expect.objectContaining({
          id: 'london-crown',
          name: 'Inner London Crown Court',
        }),
      ]));
    });

    it('should have the correct method signature', () => {
      expect(typeof controller.courtSearch).toBe('function');
    });

    it('should return courts as an array', () => {
      const result = controller.courtSearch();
      expect(Array.isArray(result.courts)).toBe(true);
    });
  });

  describe('handleNameSearch', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          csrfToken: ''
        }
      };
    });

    it('should render error when search term is empty', () => {
      const body = { fullName: '' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', {
        title: 'Find a Court or Tribunal - Court Search',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-search',
        courts: expect.any(Array),
        csrfToken: '',
        errors: {
          fullName: {
            text: 'Enter a court name, address, town or city'
          }
        },
        errorSummary: [
          {
            text: 'Enter a court name, address, town or city',
            href: '#fullName'
          }
        ],
        formData: body
      });
    });

    it('should render error when search term is not provided', () => {
      const body = {};
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        errors: expect.objectContaining({
          fullName: expect.objectContaining({
            text: 'Enter a court name, address, town or city'
          })
        })
      }));
    });

    it('should render error when search term is invalid', () => {
      const body = { fullName: 'Invalid Court Name' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        errors: expect.objectContaining({
          fullName: expect.objectContaining({
            text: 'Enter a valid court name. Valid options are: Manchester, Birmingham, or London'
          })
        })
      }));
    });

    it('should filter and show Manchester courts when searching for Manchester', () => {
      const body = { fullName: 'Manchester' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        csrfToken: '',
        filteredCourts: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Manchester')
          })
        ]),
        showResults: true,
        searchTerm: 'Manchester'
      }));
    });

    it('should filter and show Birmingham courts when searching for Birmingham', () => {
      const body = { fullName: 'Birmingham' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        csrfToken: '',
        filteredCourts: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Birmingham')
          })
        ]),
        showResults: true,
        searchTerm: 'Birmingham'
      }));
    });

    it('should filter and show London courts when searching for London', () => {
      const body = { fullName: 'London' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        csrfToken: '',
        filteredCourts: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('London')
          })
        ]),
        showResults: true,
        searchTerm: 'London'
      }));
    });

    it('should be case insensitive', () => {
      const body = { fullName: 'MANCHESTER' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      expect(mockResponse.render).toHaveBeenCalledWith('journeys/find-a-court-or-tribunal/court-search', expect.objectContaining({
        csrfToken: '',
        filteredCourts: expect.any(Array),
        showResults: true
      }));
    });

    it('should only show one court when searching for specific court', () => {
      const body = { fullName: 'Manchester' };
      
      controller.handleNameSearch(body, mockResponse as Response);
      
      const call = (mockResponse.render as jest.Mock).mock.calls[0][1];
      expect(call.filteredCourts.length).toBe(1);
      expect(call.filteredCourts[0].name).toContain('Manchester');
    });
  });

  describe('courtDetails', () => {
    it('should return the correct view data for a valid court ID', () => {
      const courtId = 'manchester-crown';
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Manchester Crown Court (Minshull St)',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: courtsData[courtId],
      });
    });

    it('should return the correct view data for birmingham crown court', () => {
      const courtId = 'birmingham-crown';
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Birmingham Crown Court',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: courtsData[courtId],
      });
    });

    it('should return the correct view data for london crown court', () => {
      const courtId = 'london-crown';
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Inner London Crown Court',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: courtsData[courtId],
      });
    });

    it('should handle invalid court ID gracefully', () => {
      const courtId = 'invalid-court-id';
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Court Details',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: undefined,
      });
    });

    it('should handle empty court ID', () => {
      const courtId = '';
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Court Details',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: undefined,
      });
    });

    it('should handle null court ID', () => {
      const courtId = null as any;
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Court Details',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: undefined,
      });
    });

    it('should handle undefined court ID', () => {
      const courtId = undefined as any;
      const result = controller.courtDetails(courtId);
      
      expect(result).toEqual({
        title: 'Court Details',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-details',
        court: undefined,
      });
    });

    it('should have the correct method signature', () => {
      expect(typeof controller.courtDetails).toBe('function');
    });

    it('should accept string parameter', () => {
      const courtId = 'manchester-crown';
      expect(() => controller.courtDetails(courtId)).not.toThrow();
    });
  });

  describe('court data structure', () => {
    it('should have the expected court data structure', () => {
      const manchesterCourt = courtsData['manchester-crown'];
      
      expect(manchesterCourt).toHaveProperty('id');
      expect(manchesterCourt).toHaveProperty('name');
      expect(manchesterCourt).toHaveProperty('address');
      expect(manchesterCourt).toHaveProperty('openingTimes');
      expect(manchesterCourt).toHaveProperty('emails');
      expect(manchesterCourt).toHaveProperty('telephones');
      expect(manchesterCourt).toHaveProperty('facilities');
      expect(manchesterCourt).toHaveProperty('image');
      expect(manchesterCourt).toHaveProperty('handles');
      expect(manchesterCourt).toHaveProperty('codes');
    });

    it('should have address with lines and mapUrl', () => {
      const manchesterCourt = courtsData['manchester-crown'];
      
      expect(manchesterCourt.address).toHaveProperty('lines');
      expect(manchesterCourt.address).toHaveProperty('mapUrl');
      expect(Array.isArray(manchesterCourt.address.lines)).toBe(true);
      expect(typeof manchesterCourt.address.mapUrl).toBe('string');
    });

    it('should have opening times with key and value structure', () => {
      const manchesterCourt = courtsData['manchester-crown'];
      
      expect(Array.isArray(manchesterCourt.openingTimes)).toBe(true);
      if (manchesterCourt.openingTimes.length > 0) {
        const openingTime = manchesterCourt.openingTimes[0];
        expect(openingTime).toHaveProperty('key');
        expect(openingTime).toHaveProperty('value');
        expect(openingTime.key).toHaveProperty('text');
        expect(openingTime.value).toHaveProperty('text');
      }
    });

    it('should have all required court properties for each court', () => {
      Object.values(courtsData).forEach(court => {
        expect(court).toHaveProperty('id');
        expect(court).toHaveProperty('name');
        expect(court).toHaveProperty('address');
        expect(court).toHaveProperty('openingTimes');
        expect(court).toHaveProperty('emails');
        expect(court).toHaveProperty('telephones');
        expect(court).toHaveProperty('facilities');
        expect(court).toHaveProperty('image');
        expect(court).toHaveProperty('handles');
        expect(court).toHaveProperty('codes');
      });
    });
  });

  describe('controller methods', () => {
    it('should have all required methods', () => {
      expect(controller.index).toBeDefined();
      expect(controller.options).toBeDefined();
      expect(controller.courtSearch).toBeDefined();
      expect(controller.courtDetails).toBeDefined();
    });

    it('should have correct method types', () => {
      expect(typeof controller.index).toBe('function');
      expect(typeof controller.options).toBe('function');
      expect(typeof controller.courtSearch).toBe('function');
      expect(typeof controller.courtDetails).toBe('function');
    });
  });
}); 