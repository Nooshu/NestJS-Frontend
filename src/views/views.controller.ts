import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ViewsController {
  @Get()
  @Render('index')
  home() {
    return { title: 'Home' };
  }

  @Get('second-page')
  @Render('second-page')
  secondPage() {
    return { title: 'Second Page' };
  }

  @Get('third-page')
  @Render('third-page')
  thirdPage() {
    return { title: 'Third Page' };
  }

  @Get('form-components')
  @Render('form-components')
  formComponents() {
    return { title: 'Form Components' };
  }

  @Get('layout-components')
  @Render('layout-components')
  layoutComponents() {
    return { title: 'Layout Components' };
  }

  @Get('feedback-components')
  @Render('feedback-components')
  feedbackComponents() {
    return { title: 'Feedback Components' };
  }

  @Get('missing-components')
  @Render('missing-components')
  missingComponents() {
    return { title: 'Missing Components' };
  }
} 