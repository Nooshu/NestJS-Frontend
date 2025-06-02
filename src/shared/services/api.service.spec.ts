import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiService } from './api.service';
import { HttpException } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

describe('ApiService', () => {
  let service: ApiService;
  let httpService: HttpService;

  const mockBaseUrl = 'http://api.example.com';
  const mockEndpoint = '/test';
  const mockData = { test: 'data' };
  const mockResponse = { data: { result: 'success' } };

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(mockBaseUrl),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
    httpService = module.get<HttpService>(HttpService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize with baseUrl from config', async () => {
      // Create a new instance to test initialization
      const mockConfigService = {
        get: jest.fn().mockReturnValue(mockBaseUrl),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApiService,
          { provide: HttpService, useValue: httpService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const newService = module.get<ApiService>(ApiService);
      expect(newService).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('api.baseUrl');
    });

    it('should handle undefined baseUrl', async () => {
      const mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApiService,
          { provide: HttpService, useValue: httpService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const newService = module.get<ApiService>(ApiService);
      expect(newService).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('api.baseUrl');
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse).pipe(take(1)));

      const result = await firstValueFrom(service.get(mockEndpoint));
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should handle GET request errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Not Found',
        response: {
          status: 404,
          data: 'Not Found',
        },
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.get(mockEndpoint))).rejects.toThrow(HttpException);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse).pipe(take(1)));

      const result = await firstValueFrom(service.post(mockEndpoint, mockData));
      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        mockData,
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should handle POST request errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Bad Request',
        response: {
          status: 400,
          data: 'Bad Request',
        },
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.post(mockEndpoint, mockData))).rejects.toThrow(HttpException);
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'put').mockReturnValue(of(mockAxiosResponse).pipe(take(1)));

      const result = await firstValueFrom(service.put(mockEndpoint, mockData));
      expect(result).toEqual(mockResponse);
      expect(httpService.put).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        mockData,
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should handle PUT request errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Bad Request',
        response: {
          status: 400,
          data: 'Bad Request',
        },
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'put').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.put(mockEndpoint, mockData))).rejects.toThrow(HttpException);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'delete').mockReturnValue(of(mockAxiosResponse).pipe(take(1)));

      const result = await firstValueFrom(service.delete(mockEndpoint));
      expect(result).toEqual(mockResponse);
      expect(httpService.delete).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should handle DELETE request errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Not Found',
        response: {
          status: 404,
          data: 'Not Found',
        },
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'delete').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.delete(mockEndpoint))).rejects.toThrow(HttpException);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.get(mockEndpoint))).rejects.toThrow(HttpException);
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.get(mockEndpoint))).rejects.toThrow(HttpException);
    });

    it('should handle server errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: 'Internal Server Error',
        },
        toJSON: () => ({}),
        name: 'AxiosError',
      } as unknown as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => mockError).pipe(take(1)));

      await expect(firstValueFrom(service.get(mockEndpoint))).rejects.toThrow(HttpException);
    });
  });

  describe('Request options', () => {
    it('should merge custom timeout with default options', async () => {
      const customTimeout = 15000;
      const customOptions = {
        timeout: customTimeout,
        headers: { 'Custom-Header': 'value' },
      };

      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await firstValueFrom(service.get(mockEndpoint, customOptions));
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        expect.objectContaining({
          timeout: customTimeout,
          headers: customOptions.headers,
        })
      );
    });

    it('should preserve all custom options while adding timeout', async () => {
      const customOptions = {
        headers: { 'Custom-Header': 'value' },
        params: { query: 'test' },
        validateStatus: (status: number) => status < 500,
        maxRedirects: 5,
      };

      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await firstValueFrom(service.get(mockEndpoint, customOptions));
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        expect.objectContaining({
          ...customOptions,
          timeout: 30000,
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle custom request options', async () => {
      const customOptions = {
        headers: { 'Custom-Header': 'value' },
        params: { query: 'test' },
      };

      const mockAxiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await firstValueFrom(service.get(mockEndpoint, customOptions));
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockBaseUrl}${mockEndpoint}`,
        expect.objectContaining({
          ...customOptions,
          timeout: 30000,
        })
      );
    });

    it('should handle different response status codes', async () => {
      const statusCodes = [200, 201, 204, 301, 302, 400, 401, 403, 404, 500];
      
      for (const status of statusCodes) {
        const mockAxiosResponse: AxiosResponse = {
          data: mockResponse,
          status,
          statusText: 'Status Text',
          headers: {},
          config: {} as any,
        };

        jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

        const result = await firstValueFrom(service.get(mockEndpoint));
        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle empty response data', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await firstValueFrom(service.get(mockEndpoint));
      expect(result).toBeNull();
    });
  });
}); 