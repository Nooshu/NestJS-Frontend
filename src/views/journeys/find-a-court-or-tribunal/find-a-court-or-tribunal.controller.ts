import { Controller, Get, Post, Param, Body, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { courtsData } from './dto/courtData';

@Controller('find-a-court-or-tribunal')
export class FindCourtTribunalController {
  @Get()
  @Render('journeys/find-a-court-or-tribunal/index')
  index() {
    return {
      title: 'Find a Court or Tribunal',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'index',
    };
  }

  @Get('options')
  @Render('journeys/find-a-court-or-tribunal/options')
  options(@Res({ passthrough: true }) res?: Response) {
    return {
      title: 'Find a Court or Tribunal - Select Option',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'options',
      csrfToken: res?.locals?.csrfToken || '',
    };
  }

  @Post('options')
  handleOptions(@Body() body: any, @Res() res: Response) {
    console.log('POST /options received with body:', body);

    const { courtOption } = body;
    const csrfToken = res?.locals?.csrfToken || '';

    console.log('Extracted courtOption:', courtOption);
    console.log('CSRF token from res.locals:', csrfToken);

    // Validate that a radio button was selected
    if (!courtOption) {
      console.log('No courtOption selected, rendering error page');
      return res.render('journeys/find-a-court-or-tribunal/options', {
        title: 'Find a Court or Tribunal - Select Option',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'options',
        csrfToken: csrfToken,
        errors: {
          courtOption: {
            text: 'Select whether you know the name of the court or tribunal',
          },
        },
        errorSummary: [
          {
            text: 'Select whether you know the name of the court or tribunal',
            href: '#courtOption',
          },
        ],
        formData: body,
      });
    }

    console.log('Valid courtOption selected, redirecting...');

    // Redirect based on selection
    if (courtOption === 'option1') {
      console.log('Redirecting to court-search with hasName=true');
      return res.redirect('/find-a-court-or-tribunal/court-search?hasName=true');
    } else if (courtOption === 'option2') {
      console.log('Redirecting to court-search with hasName=false');
      return res.redirect('/find-a-court-or-tribunal/court-search?hasName=false');
    }

    console.log('Fallback redirect to court-search');
    // Fallback redirect
    return res.redirect('/find-a-court-or-tribunal/court-search');
  }

  @Get('court-search')
  @Render('journeys/find-a-court-or-tribunal/court-search')
  courtSearch(@Res({ passthrough: true }) res?: Response) {
    const courts = Object.values(courtsData);
    return {
      title: 'Find a Court or Tribunal - Court Search',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-search',
      courts,
      csrfToken: res?.locals?.csrfToken || '',
    };
  }

  @Post('name-search')
  handleNameSearch(@Body() body: any, @Res() res: Response) {
    console.log('POST /name-search received with body:', body);

    const { fullName } = body;
    const searchTerm = fullName?.trim().toLowerCase();
    const csrfToken = res?.locals?.csrfToken || '';

    console.log('Search term:', searchTerm);
    console.log('CSRF token from res.locals:', csrfToken);

    // Validate that a search term was entered
    if (!searchTerm) {
      console.log('No search term provided, rendering error');
      return res.render('journeys/find-a-court-or-tribunal/court-search', {
        title: 'Find a Court or Tribunal - Court Search',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-search',
        courts: Object.values(courtsData),
        csrfToken: csrfToken,
        errors: {
          fullName: {
            text: 'Enter a court name, address, town or city',
          },
        },
        errorSummary: [
          {
            text: 'Enter a court name, address, town or city',
            href: '#fullName',
          },
        ],
        formData: body,
      });
    }

    // Valid court names (case-insensitive)
    const validCourts = ['manchester', 'birmingham', 'london'];

    // Check if search term matches any valid court
    const matchedCourt = validCourts.find((court) => searchTerm.includes(court));

    if (!matchedCourt) {
      console.log('Invalid court name, rendering error');
      return res.render('journeys/find-a-court-or-tribunal/court-search', {
        title: 'Find a Court or Tribunal - Court Search',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'court-search',
        courts: Object.values(courtsData),
        csrfToken: csrfToken,
        errors: {
          fullName: {
            text: 'Enter a valid court name. Valid options are: Manchester, Birmingham, or London',
          },
        },
        errorSummary: [
          {
            text: 'Enter a valid court name. Valid options are: Manchester, Birmingham, or London',
            href: '#fullName',
          },
        ],
        formData: body,
        searchTerm: fullName,
      });
    }

    // Filter courts based on search term
    const filteredCourts = Object.values(courtsData).filter((court) => {
      const courtName = court.name.toLowerCase();
      const courtAddress = court.address.lines.join(' ').toLowerCase();
      return courtName.includes(matchedCourt) || courtAddress.includes(matchedCourt);
    });

    console.log(`Found ${filteredCourts.length} court(s) matching "${searchTerm}"`);

    return res.render('journeys/find-a-court-or-tribunal/court-search', {
      title: 'Find a Court or Tribunal - Court Search',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-search',
      courts: Object.values(courtsData),
      csrfToken: res.locals.csrfToken,
      filteredCourts,
      searchTerm: fullName,
      showResults: true,
    });
  }

  @Get('court-details/:courtId')
  @Render('journeys/find-a-court-or-tribunal/court-details')
  courtDetails(@Param('courtId') courtId: string) {
    const court = courtsData[courtId];

    return {
      title: `${court?.name || 'Court Details'}`,
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-details',
      court,
    };
  }
}
