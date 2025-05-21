import { Controller, Get, Param, Render } from '@nestjs/common';
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

  @Get('court-page/:courtId')
  @Render('journeys/find-a-court-or-tribunal/court-page')
  courtPage(@Param('courtId') courtId: string) {
    const court = courtsData[courtId];

    return {
      title: `${court?.name || 'Court Details'}`,
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-page',
      court,
    };
  }
}
