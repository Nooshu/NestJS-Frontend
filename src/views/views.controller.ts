import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ViewsController {
  @Get()
  @Render('index')
  index() {
    return {
      title: 'Homepage',
      message: 'Welcome to the GOV.UK Frontend example',
    };
  }

  @Get('second-page')
  @Render('second-page')
  secondPage() {
    return {
      title: 'Second Page',
      message: 'This page demonstrates different GOV.UK components',
    };
  }

  @Get('third-page')
  @Render('third-page')
  thirdPage() {
    return {
      title: 'Third Page',
      message: 'This page demonstrates more GOV.UK components',
    };
  }
} 