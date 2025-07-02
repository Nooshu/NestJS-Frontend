import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../indicators/database.health';

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseHealthIndicator],
    }).compile();

    indicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
  });

  describe('isHealthy', () => {
    it('should return healthy status when database is responsive', async () => {
      const result = await indicator.isHealthy('database');

      expect(result).toHaveProperty('database');
      expect(result.database).toHaveProperty('status', 'up');
      expect(result.database).toHaveProperty('responseTime');
      expect(result.database).toHaveProperty('message', 'Database is responsive');
    });

    it('should include response time in the result', async () => {
      const result = await indicator.isHealthy('database');

      expect(result.database).toHaveProperty('responseTime');
      expect(typeof result.database.responseTime).toBe('number');
      expect(result.database.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw HealthCheckError when response time is too high', async () => {
      // Mock the simulateDatabaseQuery to take longer than 1 second
      jest.spyOn(indicator as any, 'simulateDatabaseQuery').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1100))
      );

      await expect(indicator.isHealthy('database')).rejects.toThrow(HealthCheckError);
    });

    it('should handle database connection errors', async () => {
      // Mock the simulateDatabaseQuery to throw an error
      jest.spyOn(indicator as any, 'simulateDatabaseQuery').mockImplementation(
        () => Promise.reject(new Error('Connection failed'))
      );

      await expect(indicator.isHealthy('database')).rejects.toThrow(HealthCheckError);
    });

    it('should handle unknown errors gracefully', async () => {
      // Mock the simulateDatabaseQuery to throw a non-Error object
      jest.spyOn(indicator as any, 'simulateDatabaseQuery').mockImplementation(
        () => Promise.reject('Unknown error')
      );

      await expect(indicator.isHealthy('database')).rejects.toThrow(HealthCheckError);
    });
  });
});
