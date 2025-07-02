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

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
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
      // OAuth2 setup is a placeholder, so we just verify it doesn't throw
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
      const javaApiError = new JavaApiError(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        { field: 'name' }
      );
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
      const javaApiError = new JavaApiError(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        { field: 'name' }
      );
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
      const javaApiError = new JavaApiError(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        { field: 'name' }
      );
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
      const javaApiError = new JavaApiError(
        'Validation error',
        400,
        'VALIDATION_ERROR',
        { field: 'name' }
      );
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

    it('should log request details', () => {
      const config: InternalAxiosRequestConfig = {
        method: 'GET',
        url: '/test',
        headers: { 'Content-Type': 'application/json' },
      } as InternalAxiosRequestConfig;

      requestInterceptor(config);

      expect(mockLogger.debug).toHaveBeenCalledWith('Java API Request', expect.objectContaining({
        method: 'GET',
        url: '/test',
        baseURL: undefined,
        headers: { 'Content-Type': 'application/json' },
        timestamp: expect.any(String),
      }));
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

      expect(mockLogger.debug).toHaveBeenCalledWith('Java API Response', expect.objectContaining({
        status: 200,
        statusText: 'OK',
        url: '/test',
        method: 'GET',
        contentLength: undefined,
        timestamp: expect.any(String),
      }));
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
      await expect(errorInterceptor(error)).rejects.toBe(error); // Should pass through network errors
      expect(mockLogger.error).toHaveBeenCalledWith('Java API Network Error', {
        message: 'Network Error',
        code: 'ECONNABORTED',
        url: undefined,
      });
    });
  });
});
