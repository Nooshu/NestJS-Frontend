import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getIndex', () => {
    it('should be defined', () => {
      expect(controller.getIndex).toBeDefined();
    });

    it('should return the correct view data', () => {
      const result = controller.getIndex();
      
      expect(result).toEqual({
        title: 'NestJS GOV.UK Frontend',
        message: 'Welcome to the NestJS GOV.UK Frontend application, this is the homepage of the application with links to all the components from the latest version of GOV.UK Frontend.',
      });
    });
  });
}); 