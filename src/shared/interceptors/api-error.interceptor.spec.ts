import { HttpException, type CallHandler, type ExecutionContext } from '@nestjs/common';
import { of, throwError, firstValueFrom } from 'rxjs';
import { ApiErrorInterceptor } from './api-error.interceptor';

describe('ApiErrorInterceptor', () => {
  let interceptor: ApiErrorInterceptor;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    interceptor = new ApiErrorInterceptor();
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/api/users' }),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through successful responses', async () => {
    const next: CallHandler = {
      handle: () => of({ data: 'ok' }),
    };

    await expect(firstValueFrom(interceptor.intercept(mockContext, next))).resolves.toEqual({
      data: 'ok',
    });
  });

  it('should transform API errors with a response message into HttpException', async () => {
    const next: CallHandler = {
      handle: () =>
        throwError(() => ({
          response: {
            status: 502,
            data: { message: 'Upstream failure' },
          },
        })),
    };

    await expect(firstValueFrom(interceptor.intercept(mockContext, next))).rejects.toBeInstanceOf(
      HttpException
    );

    try {
      await firstValueFrom(interceptor.intercept(mockContext, next));
    } catch (error) {
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(502);
      expect(httpError.getResponse()).toEqual(
        expect.objectContaining({
          status: 502,
          error: 'Upstream failure',
          path: '/api/users',
          timestamp: expect.any(String),
        })
      );
    }
  });

  it('should use a default message when API error response has no message', async () => {
    const next: CallHandler = {
      handle: () =>
        throwError(() => ({
          response: {
            status: 500,
            data: {},
          },
        })),
    };

    try {
      await firstValueFrom(interceptor.intercept(mockContext, next));
      fail('expected HttpException');
    } catch (error) {
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(500);
      expect(httpError.getResponse()).toEqual(
        expect.objectContaining({
          error: 'An error occurred',
        })
      );
    }
  });

  it('should rethrow non-API errors after retries', async () => {
    const originalError = new Error('network down');
    const next: CallHandler = {
      handle: () => throwError(() => originalError),
    };

    await expect(firstValueFrom(interceptor.intercept(mockContext, next))).rejects.toBe(
      originalError
    );
  });
});
