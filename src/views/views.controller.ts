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
} 