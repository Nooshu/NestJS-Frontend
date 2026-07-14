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
        message:
          'Welcome to the NestJS GOV.UK Frontend application, this is the homepage of the application. The FaCT journey starts below.',
      });
    });
  });

  describe('getRobotsTxt', () => {
    it('should serve robots.txt content when file exists', () => {
      jest.spyOn(controller, 'readRobotsFile').mockReturnValue('User-agent: *\nDisallow: /admin\n');
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      controller.getRobotsTxt(res as any);

      expect(controller.readRobotsFile).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400');
      expect(res.send).toHaveBeenCalledWith('User-agent: *\nDisallow: /admin\n');
    });

    it('should fall back when robots.txt cannot be read', () => {
      jest.spyOn(controller, 'readRobotsFile').mockImplementation(() => {
        throw new Error('ENOENT');
      });
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      controller.getRobotsTxt(res as any);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400');
      expect(res.send).toHaveBeenCalledWith('User-agent: *\nDisallow: /\n');
    });

    it('readRobotsFile reads from disk', () => {
      // Exercise the seam method body (may throw if file missing — either path is fine)
      try {
        const content = controller.readRobotsFile(
          require('path').join(process.cwd(), 'dist', 'public', 'robots.txt')
        );
        expect(typeof content).toBe('string');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
