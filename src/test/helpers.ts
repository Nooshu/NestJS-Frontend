import type { INestApplication } from '@nestjs/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

/**
 * Creates a test application instance
 */
export const createTestApp = async (): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Frontend API')
    .setDescription('API documentation for the NestJS Frontend application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Setup global prefix
  app.setGlobalPrefix('api');

  // Setup logger
  const logger = new Logger('Test');
  app.useLogger(logger);

  return app;
};

/**
 * Creates a test module instance
 */
export const createTestModule = async (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [AppModule],
  }).compile();
};

/**
 * Mock performance API
 */
export const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  now: jest.fn(),
  eventCounts: {},
  navigation: {},
  onresourcetimingbufferfull: null,
  timing: {},
  toJSON: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

/**
 * Mock console methods
 */
export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

/**
 * Custom test matchers
 */
export const customMatchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
};

/**
 * Test environment setup
 */
export const setupTestEnvironment = () => {
  // Set global test timeout
  jest.setTimeout(30000);

  // Mock console
  global.console = {
    ...console,
    ...mockConsole,
  };

  // Mock performance
  global.performance = mockPerformance as any;

  // Add custom matchers
  expect.extend(customMatchers);
};

/**
 * Test environment cleanup
 */
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};
