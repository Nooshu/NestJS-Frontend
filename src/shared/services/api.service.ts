import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, type AxiosResponse } from 'axios';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service for handling HTTP requests to external APIs.
 * Provides methods for making HTTP requests with built-in error handling,
 * timeout management, and response transformation.
 *
 * @class ApiService
 * @description Central service for making HTTP requests to external APIs
 */
@Injectable()
export class ApiService {
  private readonly httpService: HttpService;
  private readonly configService: ConfigService;
  /**
   * Base URL for API requests, configured through environment variables
   */
  private readonly baseUrl: string | undefined;

  constructor(httpService: HttpService, configService: ConfigService) {
    this.httpService = httpService;
    this.configService = configService;
    this.baseUrl = this.configService.get<string>('api.baseUrl');
  }

  /**
   * Default timeout for API requests in milliseconds
   */
  private readonly defaultTimeout = 30000; // 30 seconds

  /**
   * Handles API errors and transforms them into standardized error responses
   *
   * @private
   * @param {AxiosError} error - The error object from the HTTP request
   * @returns {Observable<never>} An observable that emits the error
   */
  private handleError(error: AxiosError) {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage = error.response?.data || 'An error occurred';

    return throwError(
      () =>
        new HttpException(
          {
            status,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          },
          status
        )
    );
  }

  /**
   * Makes a GET request to the specified endpoint
   *
   * @template T - The expected response type
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Additional request options
   * @returns {Observable<T>} An observable that emits the response data
   */
  get<T>(endpoint: string, options = {}): Observable<T> {
    return this.httpService
      .get<T>(`${this.baseUrl}${endpoint}`, {
        ...options,
        timeout: this.defaultTimeout,
      })
      .pipe(
        timeout(this.defaultTimeout),
        map((response: AxiosResponse<T>) => response.data),
        catchError((error: AxiosError) => this.handleError(error))
      );
  }

  /**
   * Makes a POST request to the specified endpoint
   *
   * @template T - The expected response type
   * @param {string} endpoint - The API endpoint to call
   * @param {any} data - The data to send in the request body
   * @param {Object} options - Additional request options
   * @returns {Observable<T>} An observable that emits the response data
   */
  post<T>(endpoint: string, data: any, options = {}): Observable<T> {
    return this.httpService
      .post<T>(`${this.baseUrl}${endpoint}`, data, {
        ...options,
        timeout: this.defaultTimeout,
      })
      .pipe(
        timeout(this.defaultTimeout),
        map((response: AxiosResponse<T>) => response.data),
        catchError((error: AxiosError) => this.handleError(error))
      );
  }

  /**
   * Makes a PUT request to the specified endpoint
   *
   * @template T - The expected response type
   * @param {string} endpoint - The API endpoint to call
   * @param {any} data - The data to send in the request body
   * @param {Object} options - Additional request options
   * @returns {Observable<T>} An observable that emits the response data
   */
  put<T>(endpoint: string, data: any, options = {}): Observable<T> {
    return this.httpService
      .put<T>(`${this.baseUrl}${endpoint}`, data, {
        ...options,
        timeout: this.defaultTimeout,
      })
      .pipe(
        timeout(this.defaultTimeout),
        map((response: AxiosResponse<T>) => response.data),
        catchError((error: AxiosError) => this.handleError(error))
      );
  }

  /**
   * Makes a DELETE request to the specified endpoint
   *
   * @template T - The expected response type
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Additional request options
   * @returns {Observable<T>} An observable that emits the response data
   */
  delete<T>(endpoint: string, options = {}): Observable<T> {
    return this.httpService
      .delete<T>(`${this.baseUrl}${endpoint}`, {
        ...options,
        timeout: this.defaultTimeout,
      })
      .pipe(
        timeout(this.defaultTimeout),
        map((response: AxiosResponse<T>) => response.data),
        catchError((error: AxiosError) => this.handleError(error))
      );
  }
}
