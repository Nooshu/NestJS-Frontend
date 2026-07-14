import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HealthCheckError } from '@nestjs/terminus';
import { of, throwError } from 'rxjs';
import { HttpHealthIndicator } from '../indicators/http.health';

describe('HttpHealthIndicator', () => {
  let indicator: HttpHealthIndicator;
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpHealthIndicator,
          useFactory: () => {
            const instance = new HttpHealthIndicator();
            instance.httpService = httpService as any;
            return instance;
          },
        },
      ],
    }).compile();

    indicator = module.get(HttpHealthIndicator);
  });

  const mockSuccess = (status = 200, headers: Record<string, string> = {}) => {
    httpService.get.mockReturnValue(
      of({
        status,
        headers: {
          'content-type': 'application/json',
          server: 'test-server',
          ...headers,
        },
        data: {},
      })
    );
  };

  const invokeValidateStatus = () => {
    const options = httpService.get.mock.calls[0][1];
    expect(options.validateStatus(999)).toBe(true);
  };

  describe('pingCheck', () => {
    it('should return healthy status for successful ping', async () => {
      mockSuccess();

      const result = await indicator.pingCheck('http', 'https://example.com/health');

      invokeValidateStatus();
      expect(result.http.status).toBe('up');
      expect(result.http).toMatchObject({
        url: 'https://example.com/health',
        statusCode: 200,
        message: 'HTTP service is responsive',
        headers: {
          contentType: 'application/json',
          server: 'test-server',
        },
      });
    });

    it('should use default options', async () => {
      mockSuccess();
      await indicator.pingCheck('http', 'https://example.com');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ timeout: 5000 })
      );
    });

    it('should fail on unexpected status code', async () => {
      mockSuccess(500);

      await expect(
        indicator.pingCheck('http', 'https://example.com', { expectedStatus: 200 })
      ).rejects.toThrow(HealthCheckError);
    });

    it('should fail when response time exceeds limit', async () => {
      mockSuccess();
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(5000);

      await expect(
        indicator.pingCheck('http', 'https://example.com', { expectedResponseTime: 100 })
      ).rejects.toThrow(HealthCheckError);

      nowSpy.mockRestore();
    });

    it('should include both status and response time issues', async () => {
      mockSuccess(404);
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(5000);

      await expect(
        indicator.pingCheck('http', 'https://example.com', {
          expectedStatus: 200,
          expectedResponseTime: 100,
        })
      ).rejects.toThrow(HealthCheckError);

      nowSpy.mockRestore();
    });

    it('should wrap request errors as HealthCheckError', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('network down')));

      await expect(indicator.pingCheck('http', 'https://example.com')).rejects.toThrow(
        HealthCheckError
      );
    });

    it('should handle non-Error request failures', async () => {
      httpService.get.mockReturnValue(throwError(() => 'network-broken'));

      await expect(indicator.pingCheck('http', 'https://example.com')).rejects.toThrow(
        HealthCheckError
      );
    });
  });

  describe('checkMultipleEndpoints', () => {
    it('should return healthy when enough endpoints succeed', async () => {
      httpService.get
        .mockReturnValueOnce(of({ status: 200, headers: {}, data: {} }))
        .mockReturnValueOnce(of({ status: 200, headers: {}, data: {} }));

      const result = await indicator.checkMultipleEndpoints('multi', [
        { name: 'a', url: 'https://a.example' },
        { name: 'b', url: 'https://b.example', timeout: 1000, expectedStatus: 200 },
      ]);

      expect(httpService.get.mock.calls[0][1].validateStatus(418)).toBe(true);
      expect(result.multi.status).toBe('up');
      expect(result.multi.healthyCount).toBe(2);
      expect(result.multi.totalCount).toBe(2);
    });

    it('should mark failed endpoints unhealthy and fail overall when below threshold', async () => {
      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('fail')))
        .mockReturnValueOnce(throwError(() => 'fail-string'));

      await expect(
        indicator.checkMultipleEndpoints('multi', [
          { name: 'a', url: 'https://a.example' },
          { name: 'b', url: 'https://b.example' },
        ])
      ).rejects.toThrow(HealthCheckError);
    });

    it('should treat unexpected status as unhealthy endpoint', async () => {
      httpService.get
        .mockReturnValueOnce(of({ status: 500, headers: {}, data: {} }))
        .mockReturnValueOnce(of({ status: 500, headers: {}, data: {} }));

      await expect(
        indicator.checkMultipleEndpoints('multi', [
          { name: 'a', url: 'https://a.example', expectedStatus: 200 },
          { name: 'b', url: 'https://b.example' },
        ])
      ).rejects.toThrow(HealthCheckError);
    });

    it('should handle rejected promises from allSettled mapping', async () => {
      jest.spyOn(Promise, 'allSettled').mockResolvedValueOnce([
        {
          status: 'rejected',
          reason: new Error('rejected'),
        },
        {
          status: 'fulfilled',
          value: {
            name: 'ok',
            url: 'https://ok.example',
            status: 'healthy',
            statusCode: 200,
            responseTime: 10,
            isHealthy: true,
          },
        },
      ] as PromiseSettledResult<any>[]);

      // 1/2 healthy meets threshold (ceil(2/2)=1)
      const result = await indicator.checkMultipleEndpoints('multi', [
        { name: 'a', url: 'https://a.example' },
        { name: 'b', url: 'https://b.example' },
      ]);

      expect(result.multi.status).toBe('up');
      expect(result.multi.endpoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'unknown', status: 'error', isHealthy: false }),
        ])
      );
    });

    it('should handle non-Error throws in multiple endpoint check', async () => {
      jest.spyOn(Promise, 'allSettled').mockImplementationOnce(() => {
        throw 'multi-broken';
      });

      await expect(
        indicator.checkMultipleEndpoints('multi', [{ name: 'a', url: 'https://a.example' }])
      ).rejects.toThrow(HealthCheckError);
    });
  });
});
