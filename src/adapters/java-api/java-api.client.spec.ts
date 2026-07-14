import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Logger } from 'winston';
import { JavaApiClient, JavaApiClientConfig, JavaApiError } from './java-api.client';

jest.mock('axios');
jest.mock('winston');

describe('JavaApiClient', () => {
  let client: JavaApiClient;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<Logger>;
  let config: JavaApiClientConfig;
  let mockErrorInterceptor: (error: AxiosError) => Promise<never>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Setup mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: {
          use: jest.fn((_, onRejected) => {
            // Store the error interceptor for later use
            if (onRejected) {
              mockErrorInterceptor = onRejected;
            }
            return { eject: jest.fn() };
          }),
        },
      },
      defaults: {
        headers: { common: {} },
        auth: undefined,
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    // Default config
    config = {
      baseUrl: 'https://api.example.gov.uk',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    client = new JavaApiClient(config, mockLogger);

    // Re-bind errorInterceptor to the client instance
    if (mockErrorInterceptor) {
      mockErrorInterceptor = mockErrorInterceptor.bind(client);
    }
  });

  describe('initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'NestJS-JavaApiClient/1.0',
        },
      });
    });

    it('should use default timeout and retry settings', () => {
      new JavaApiClient({ baseUrl: 'https://api.example.gov.uk' }, mockLogger);
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.gov.uk',
          timeout: 30000,
        })
      );
    });

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('JavaApiError', () => {
    it('should set name and capture stack when available', () => {
      const error = new JavaApiError('fail', 500, 'CODE', { a: 1 });
      expect(error.name).toBe('JavaApiError');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('CODE');
      expect(error.details).toEqual({ a: 1 });
      expect(error.stack).toBeDefined();
    });

    it('should construct without captureStackTrace when unavailable', () => {
      const original = Error.captureStackTrace;
      // @ts-expect-error forcing missing captureStackTrace branch
      Error.captureStackTrace = undefined;
      try {
        const error = new JavaApiError('fail', 400);
        expect(error.name).toBe('JavaApiError');
        expect(error.statusCode).toBe(400);
      } finally {
        Error.captureStackTrace = original;
      }
    });
  });

  describe('authentication', () => {
    it('should setup basic auth', () => {
      const basicAuthConfig: JavaApiClientConfig = {
        ...config,
        auth: {
          type: 'basic',
          credentials: {
            username: 'testuser',
            password: 'testpass',
          },
        },
      };

      new JavaApiClient(basicAuthConfig, mockLogger);

      expect(mockAxiosInstance.defaults.auth).toEqual({
        username: 'testuser',
        password: 'testpass',
      });
    });

    it('should use empty credentials for incomplete basic auth', () => {
      new JavaApiClient(
        {
          ...config,
          auth: {
            type: 'basic',
            credentials: {},
          },
        },
        mockLogger
      );

      expect(mockAxiosInstance.defaults.auth).toEqual({
        username: '',
        password: '',
      });
    });

    it('should skip auth setup when auth is not provided', () => {
      new JavaApiClient({ baseUrl: 'https://api.example.gov.uk' }, mockLogger);
      expect(mockAxiosInstance.defaults.auth).toBeUndefined();
    });

    it('should setup bearer auth', () => {
      const bearerAuthConfig: JavaApiClientConfig = {
        ...config,
        auth: {
          type: 'bearer',
          credentials: {
            token: 'test-token',
          },
        },
      };

      new JavaApiClient(bearerAuthConfig, mockLogger);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    });

    it('should setup OAuth2 auth', () => {
      const oauth2Config: JavaApiClientConfig = {
        ...config,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: 'test-client',
            clientSecret: 'test-secret',
          },
        },
      };

      new JavaApiClient(oauth2Config, mockLogger);
      expect(mockLogger.warn).toHaveBeenCalledWith('OAuth2 authentication is not yet implemented');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = { data: { id: 1, name: 'Test' } };

    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);
    });

    it('should make GET request', async () => {
      const result = await client.get('/test');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request', async () => {
      const data = { name: 'Test' };
      const result = await client.post('/test', data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PUT request', async () => {
      const data = { name: 'Test' };
      const result = await client.put('/test', data);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE request', async () => {
      const result = await client.delete('/test');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle GET request error', async () => {
      const javaApiError = new JavaApiError('Validation error', 400, 'VALIDATION_ERROR', {
        field: 'name',
      });
      mockAxiosInstance.get.mockRejectedValue(javaApiError);

      try {
        await client.get('/test');
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(JavaApiError);
        expect(err).toMatchObject({
          message: 'Validation error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: { field: 'name' },
        });
      }
      expect(mockLogger.error).toHaveBeenCalledWith('Java API GET Error', {
        path: '/test',
        config: undefined,
        error: 'Validation error',
      });
    });

    it('should handle POST request error', async () => {
      const javaApiError = new JavaApiError('Validation error', 400, 'VALIDATION_ERROR', {
        field: 'name',
      });
      mockAxiosInstance.post.mockRejectedValue(javaApiError);

      try {
        await client.post('/test', {});
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(JavaApiError);
        expect(err).toMatchObject({
          message: 'Validation error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: { field: 'name' },
        });
      }
      expect(mockLogger.error).toHaveBeenCalledWith('Java API POST Error', {
        path: '/test',
        dataType: 'object',
        config: undefined,
        error: 'Validation error',
      });
    });

    it('should handle PUT request error', async () => {
      const javaApiError = new JavaApiError('Validation error', 400, 'VALIDATION_ERROR', {
        field: 'name',
      });
      mockAxiosInstance.put.mockRejectedValue(javaApiError);

      try {
        await client.put('/test', {});
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(JavaApiError);
        expect(err).toMatchObject({
          message: 'Validation error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: { field: 'name' },
        });
      }
      expect(mockLogger.error).toHaveBeenCalledWith('Java API PUT Error', {
        path: '/test',
        dataType: 'object',
        config: undefined,
        error: 'Validation error',
      });
    });

    it('should handle DELETE request error', async () => {
      const javaApiError = new JavaApiError('Validation error', 400, 'VALIDATION_ERROR', {
        field: 'name',
      });
      mockAxiosInstance.delete.mockRejectedValue(javaApiError);

      try {
        await client.delete('/test');
        fail('Expected error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(JavaApiError);
        expect(err).toMatchObject({
          message: 'Validation error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: { field: 'name' },
        });
      }
      expect(mockLogger.error).toHaveBeenCalledWith('Java API DELETE Error', {
        path: '/test',
        config: undefined,
        error: 'Validation error',
      });
    });

    it('should rethrow axios errors with response via handleJavaApiError', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { error: 'missing', code: 'NOT_FOUND', errors: ['x'] },
          statusText: 'Not Found',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: 'Request failed',
        name: 'AxiosError',
        toJSON: () => ({}),
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(axiosError);
      mockAxiosInstance.post.mockRejectedValue(axiosError);
      mockAxiosInstance.put.mockRejectedValue(axiosError);
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(client.get('/missing')).rejects.toBeInstanceOf(JavaApiError);
      await expect(client.post('/missing', { a: 1 })).rejects.toBeInstanceOf(JavaApiError);
      await expect(client.put('/missing', { a: 1 })).rejects.toBeInstanceOf(JavaApiError);
      await expect(client.delete('/missing')).rejects.toBeInstanceOf(JavaApiError);
    });

    it('should rethrow axios network errors without response', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'timeout',
        name: 'AxiosError',
        toJSON: () => ({}),
        config: {} as InternalAxiosRequestConfig,
      } as AxiosError;

      (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(axiosError);
      mockAxiosInstance.post.mockRejectedValue(axiosError);
      mockAxiosInstance.put.mockRejectedValue(axiosError);
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(client.get('/timeout')).rejects.toBe(axiosError);
      await expect(client.post('/timeout')).rejects.toBe(axiosError);
      await expect(client.put('/timeout')).rejects.toBe(axiosError);
      await expect(client.delete('/timeout')).rejects.toBe(axiosError);
    });

    it('should rethrow non-axios errors and sanitize config logging', async () => {
      (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);
      mockAxiosInstance.get.mockRejectedValue('weird');
      mockAxiosInstance.post.mockRejectedValue('weird');
      mockAxiosInstance.put.mockRejectedValue('weird');
      mockAxiosInstance.delete.mockRejectedValue('weird');

      await expect(
        client.get('/x', {
          headers: { authorization: 'secret', cookie: 'c', 'x-api-key': 'k', 'x-auth-token': 't' },
          auth: { username: 'u', password: 'p' },
        })
      ).rejects.toBe('weird');
      await expect(client.post('/x', undefined, { headers: { authorization: 'secret' } })).rejects.toBe(
        'weird'
      );
      await expect(client.put('/x', 'text', { headers: { cookie: 'c' } })).rejects.toBe('weird');
      await expect(client.delete('/x', { headers: { 'x-api-key': 'k' } })).rejects.toBe('weird');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Java API GET Error',
        expect.objectContaining({
          config: expect.objectContaining({
            headers: expect.objectContaining({ authorization: '***REDACTED***' }),
            auth: { username: '***REDACTED***', password: '***REDACTED***' },
          }),
          error: 'Unknown error',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle Java API error response', () => {
      const errorResponse: AxiosResponse = {
        status: 400,
        data: {
          message: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: { field: 'name' },
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const javaError = client['handleJavaApiError'](errorResponse);

      expect(javaError).toBeInstanceOf(JavaApiError);
      expect(javaError.message).toBe('Validation error');
      expect(javaError.statusCode).toBe(400);
      expect(javaError.errorCode).toBe('VALIDATION_ERROR');
      expect(javaError.details).toEqual({ field: 'name' });
    });

    it('should handle Java API error with missing fields', () => {
      const errorResponse: AxiosResponse = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const javaError = client['handleJavaApiError'](errorResponse);

      expect(javaError).toBeInstanceOf(JavaApiError);
      expect(javaError.message).toBe('HTTP 500 Error');
      expect(javaError.statusCode).toBe(500);
      expect(javaError.errorCode).toBeUndefined();
      expect(javaError.details).toEqual({});
    });

    it('should fall back to error/code/errors fields', () => {
      const javaError = client['handleJavaApiError']({
        status: 400,
        data: { error: 'bad', code: 'BAD', errors: ['a'] },
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      expect(javaError.message).toBe('bad');
      expect(javaError.errorCode).toBe('BAD');
      expect(javaError.details).toEqual(['a']);
    });
  });

  describe('interceptors', () => {
    let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    let responseInterceptor: (response: AxiosResponse) => AxiosResponse;
    let errorInterceptor: (error: AxiosError) => Promise<never>;

    beforeEach(() => {
      // Get the registered interceptors
      const requestUse = mockAxiosInstance.interceptors.request.use as jest.Mock;
      const responseUse = mockAxiosInstance.interceptors.response.use as jest.Mock;

      requestInterceptor = requestUse.mock.calls[0][0];
      responseInterceptor = responseUse.mock.calls[0][0];
      errorInterceptor = responseUse.mock.calls[0][1];
    });

    it('should log request details and sanitize sensitive headers', () => {
      const config: InternalAxiosRequestConfig = {
        method: 'GET',
        url: '/test',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer secret',
          cookie: 'a=b',
        },
      } as InternalAxiosRequestConfig;

      requestInterceptor(config);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Java API Request',
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          headers: expect.objectContaining({
            authorization: '***REDACTED***',
            cookie: '***REDACTED***',
          }),
        })
      );
    });

    it('should handle request interceptor errors', async () => {
      const requestUse = mockAxiosInstance.interceptors.request.use as jest.Mock;
      const requestErrorInterceptor = requestUse.mock.calls[0][1];
      const error = new Error('request failed');

      await expect(requestErrorInterceptor(error)).rejects.toBe(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Java API Request Error', {
        error: 'request failed',
        stack: error.stack,
      });
    });

    it('should handle missing headers in sanitizeHeaders', () => {
      expect(client['sanitizeHeaders'](undefined)).toBeUndefined();
      expect(client['sanitizeHeaders'](null)).toBeNull();
    });

    it('should sanitize config without headers', () => {
      expect(client['sanitizeConfig']({ params: { a: 1 } })).toEqual({ params: { a: 1 } });
      expect(client['sanitizeConfig'](undefined)).toBeUndefined();
    });

    it('should log response details', () => {
      const response: AxiosResponse = {
        status: 200,
        config: { url: '/test', method: 'GET' } as InternalAxiosRequestConfig,
        data: {},
        headers: {},
        statusText: 'OK',
      };

      responseInterceptor(response);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Java API Response',
        expect.objectContaining({
          status: 200,
          statusText: 'OK',
          url: '/test',
          method: 'GET',
          contentLength: undefined,
          timestamp: expect.any(String),
        })
      );
    });

    it('should transform API error responses in the response interceptor', async () => {
      const error = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'bad', errorCode: 'BAD', details: { x: 1 } },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: { url: '/test', method: 'post' } as InternalAxiosRequestConfig,
        name: 'AxiosError',
        toJSON: () => ({}),
      } as AxiosError;

      await expect(errorInterceptor(error)).rejects.toBeInstanceOf(JavaApiError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Java API Error',
        expect.objectContaining({
          status: 400,
          errorCode: 'BAD',
          message: 'bad',
        })
      );
    });

    it('should handle network error without response', async () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        config: {} as InternalAxiosRequestConfig,
        name: 'AxiosError',
        toJSON: () => ({}),
      } as AxiosError;
      await expect(errorInterceptor(error)).rejects.toBe(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Java API Network Error', {
        message: 'Network Error',
        code: 'ECONNABORTED',
        url: undefined,
      });
    });
  });
});
