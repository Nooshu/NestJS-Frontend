/**
 * Jest setup file for configuring testing environment.
 * Sets up jest-dom and other testing utilities.
 */

import '@testing-library/jest-dom';

// Mock the document object for Node.js environment
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;
}

import type { INestApplication } from '@nestjs/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { performance } from 'perf_hooks';
import { AppModule } from '../app.module';
import { cleanupTestEnvironment, setupTestEnvironment } from './helpers';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock performance API
global.performance = {
  ...performance,
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  now: jest.fn(),
  eventCounts: new Map() as unknown as EventCounts,
  navigation: {},
  onresourcetimingbufferfull: null,
  timing: {},
  toJSON: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as Performance;

// Global test utilities
export const createTestingApp = async (): Promise<INestApplication> => {
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

// Setup test environment
setupTestEnvironment();

// Global test hooks
beforeAll(async () => {
  // Setup any global test environment
});

afterAll(async () => {
  // Cleanup any global test environment
});

beforeEach(async () => {
  // Setup before each test
});

afterEach(async () => {
  // Cleanup after each test
  cleanupTestEnvironment();
});

// Custom matchers
expect.extend({
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
});

// Type definitions for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}
