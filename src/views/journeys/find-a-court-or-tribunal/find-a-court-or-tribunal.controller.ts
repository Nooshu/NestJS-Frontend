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
  options() {
    return {
      title: 'Find a Court or Tribunal - Select Option',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'options',
    };
  }

  @Post('options')
  handleOptions(@Body() body: any, @Res() res: Response) {
    console.log('POST /options received with body:', body);
    
    const { courtOption } = body;
    console.log('Extracted courtOption:', courtOption);
    
    // Validate that a radio button was selected
    if (!courtOption) {
      console.log('No courtOption selected, rendering error page');
      return res.render('journeys/find-a-court-or-tribunal/options', {
        title: 'Find a Court or Tribunal - Select Option',
        journey: 'find-a-court-or-tribunal',
        currentPage: 'options',
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
  courtSearch() {
    const courts = Object.values(courtsData);
    return {
      title: 'Find a Court or Tribunal - Court Search',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-search',
      courts,
    };
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
