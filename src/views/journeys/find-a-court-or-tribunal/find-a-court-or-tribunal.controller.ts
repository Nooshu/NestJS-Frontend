import { Controller, Get, Render } from '@nestjs/common';

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
    return {
      title: 'Find a Court or Tribunal - Court Search',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-search',
    };
  }

  @Get('court-page')
  @Render('journeys/find-a-court-or-tribunal/court-page')
  courtPage() {
    return {
      title: 'Find a Court or Tribunal - Court Page',
      journey: 'find-a-court-or-tribunal',
      currentPage: 'court-page',
    };
  }
}
