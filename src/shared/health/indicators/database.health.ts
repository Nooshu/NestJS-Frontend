import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

/**
 * Database health indicator for monitoring database connectivity and performance.
 * This is a placeholder implementation - replace with actual database connection logic.
 */
@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  /**
   * Check database health including connection status and query performance.
   * @param key - The key for the health check result
   * @returns Promise<HealthIndicatorResult>
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Simulate database connection check
      // Replace this with actual database connection logic
      const startTime = Date.now();

      // Simulate database query
      await this.simulateDatabaseQuery();

      const responseTime = Date.now() - startTime;
      const isHealthy = responseTime < 1000; // Consider healthy if response time < 1s

      if (!isHealthy) {
        throw new HealthCheckError(
          'Database check failed',
          this.getStatus(key, false, {
            responseTime,
            message: 'Database response time too high',
          })
        );
      }

      return this.getStatus(key, true, {
        responseTime,
        message: 'Database is responsive',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
      const errorName = error instanceof Error ? error.name : 'DatabaseError';

      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }

  /**
   * Simulate database query - replace with actual database logic
   */
  private async simulateDatabaseQuery(): Promise<void> {
    return new Promise((resolve) => {
      // Simulate database query delay
      setTimeout(resolve, Math.random() * 100);
    });
  }
}
