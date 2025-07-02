import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

/**
 * HTTP health indicator for monitoring external service dependencies.
 */
@Injectable()
export class HttpHealthIndicator extends HealthIndicator {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  /**
   * Check HTTP service health by making a request to the specified URL.
   * @param key - The key for the health check result
   * @param url - The URL to check
   * @param options - Additional options for the health check
   * @returns Promise<HealthIndicatorResult>
   */
  async pingCheck(
    key: string,
    url: string,
    options: {
      timeout?: number;
      expectedStatus?: number;
      expectedResponseTime?: number;
    } = {}
  ): Promise<HealthIndicatorResult> {
    const {
      timeout: timeoutMs = 5000,
      expectedStatus = 200,
      expectedResponseTime = 3000,
    } = options;

    try {
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: timeoutMs,
          validateStatus: () => true, // Don't throw on non-2xx status codes
        }).pipe(timeout(timeoutMs))
      );

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      const isStatusHealthy = statusCode === expectedStatus;
      const isResponseTimeHealthy = responseTime <= expectedResponseTime;
      const isHealthy = isStatusHealthy && isResponseTimeHealthy;

      if (!isHealthy) {
        const issues = [];
        if (!isStatusHealthy) {
          issues.push(`Expected status ${expectedStatus}, got ${statusCode}`);
        }
        if (!isResponseTimeHealthy) {
          issues.push(`Response time ${responseTime}ms exceeds limit ${expectedResponseTime}ms`);
        }

        throw new HealthCheckError(
          `HTTP check failed for ${url}`,
          this.getStatus(key, false, {
            url,
            statusCode,
            responseTime,
            expectedStatus,
            expectedResponseTime,
            message: issues.join(', '),
          })
        );
      }

      return this.getStatus(key, true, {
        url,
        statusCode,
        responseTime,
        message: 'HTTP service is responsive',
        headers: {
          contentType: response.headers['content-type'],
          server: response.headers['server'],
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'HTTP request failed';
      const errorName = error instanceof Error ? error.name : 'HttpError';

      throw new HealthCheckError(
        `HTTP check failed for ${url}`,
        this.getStatus(key, false, {
          url,
          message: errorMessage,
          error: errorName,
          timeout: timeoutMs,
        })
      );
    }
  }

  /**
   * Check multiple HTTP endpoints and return aggregated results.
   * @param key - The key for the health check result
   * @param endpoints - Array of endpoints to check
   * @returns Promise<HealthIndicatorResult>
   */
  async checkMultipleEndpoints(
    key: string,
    endpoints: Array<{
      name: string;
      url: string;
      timeout?: number;
      expectedStatus?: number;
    }>
  ): Promise<HealthIndicatorResult> {
    try {
      const results = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const startTime = Date.now();
          try {
            const response = await firstValueFrom(
              this.httpService.get(endpoint.url, {
                timeout: endpoint.timeout || 5000,
                validateStatus: () => true,
              }).pipe(timeout(endpoint.timeout || 5000))
            );

            const responseTime = Date.now() - startTime;
            return {
              name: endpoint.name,
              url: endpoint.url,
              status: 'healthy',
              statusCode: response.status,
              responseTime,
              isHealthy: response.status === (endpoint.expectedStatus || 200),
            };
          } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
              name: endpoint.name,
              url: endpoint.url,
              status: 'unhealthy',
              responseTime,
              isHealthy: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      const endpointResults = results.map((result) =>
        result.status === 'fulfilled' ? result.value : {
          name: 'unknown',
          status: 'error',
          isHealthy: false,
          error: 'Promise rejected',
        }
      );

      const healthyCount = endpointResults.filter(r => r.isHealthy).length;
      const totalCount = endpointResults.length;
      const overallHealthy = healthyCount === totalCount;

      if (!overallHealthy) {
        throw new HealthCheckError(
          'Some HTTP endpoints are unhealthy',
          this.getStatus(key, false, {
            healthyCount,
            totalCount,
            endpoints: endpointResults,
            message: `${healthyCount}/${totalCount} endpoints are healthy`,
          })
        );
      }

      return this.getStatus(key, true, {
        healthyCount,
        totalCount,
        endpoints: endpointResults,
        message: 'All HTTP endpoints are healthy',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Multiple endpoint check failed';
      const errorName = error instanceof Error ? error.name : 'MultipleHttpError';

      throw new HealthCheckError(
        'Multiple HTTP endpoint check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          error: errorName,
        })
      );
    }
  }
}
