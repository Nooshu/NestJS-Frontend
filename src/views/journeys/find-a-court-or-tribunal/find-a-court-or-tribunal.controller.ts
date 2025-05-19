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
}
