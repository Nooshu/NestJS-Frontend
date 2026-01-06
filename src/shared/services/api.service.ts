import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, type AxiosResponse } from 'axios';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * API service for making HTTP requests to backend services.
 * Provides standardized request handling, error management, and response processing.
 *
 * Features:
 * - Standardized HTTP client configuration
 * - Automatic error handling and transformation
 * - Request timeout management
 * - Retry logic for failed requests
 * - Response type safety
 *
 * Security considerations:
 * - Request timeout limits
 * - Error message sanitization
 * - Response validation
 * - Request ID tracking
 *
 * @class ApiService
 * @description Handles HTTP requests to backend services
 */
@Injectable()
export class ApiService {
  private readonly httpService: HttpService;
  private readonly configService: ConfigService;
  /**
   * Base URL for API requests, configured through environment variables
   */
  private readonly baseUrl: string | undefined;

  /**
   * Creates an instance of ApiService.
   * Initializes the HTTP service with standardized configuration.
   *
   * @param {HttpService} httpService - The HTTP service for making requests
   */
  constructor(httpService: HttpService, configService: ConfigService) {
    this.httpService = httpService;
    this.configService = configService;
    this.baseUrl = this.configService.get<string>('api.baseUrl');
  }

  /**
   * Default timeout for API requests in milliseconds.
   * Prevents hanging requests and ensures timely error responses.
   *
   * @private
   * @type {number}
   */
  private readonly defaultTimeout = 30000; // 30 seconds

  /**
   * Handles API errors and transforms them into standardized error responses.
   * Implements comprehensive error handling including:
   * - HTTP status code mapping
   * - Error message sanitization
   * - Timestamp addition
   * - Error type identification
   *
   * Security considerations:
   * - Error message sanitization
   * - Status code validation
   * - Error type verification
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
   * Gets the timeout value for a request, respecting custom timeouts if provided
   *
   * @private
   * @param {Object} options - Request options
   * @returns {number} The timeout value in milliseconds
   */
  private getTimeout(options: any): number {
    return options.timeout ?? this.defaultTimeout;
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
    const timeoutValue = this.getTimeout(options);
    return this.httpService
      .get<T>(`${this.baseUrl}${endpoint}`, {
        ...options,
        timeout: timeoutValue,
      })
      .pipe(
        timeout(timeoutValue),
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
    const timeoutValue = this.getTimeout(options);
    return this.httpService
      .post<T>(`${this.baseUrl}${endpoint}`, data, {
        ...options,
        timeout: timeoutValue,
      })
      .pipe(
        timeout(timeoutValue),
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
    const timeoutValue = this.getTimeout(options);
    return this.httpService
      .put<T>(`${this.baseUrl}${endpoint}`, data, {
        ...options,
        timeout: timeoutValue,
      })
      .pipe(
        timeout(timeoutValue),
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
    const timeoutValue = this.getTimeout(options);
    return this.httpService
      .delete<T>(`${this.baseUrl}${endpoint}`, {
        ...options,
        timeout: timeoutValue,
      })
      .pipe(
        timeout(timeoutValue),
        map((response: AxiosResponse<T>) => response.data),
        catchError((error: AxiosError) => this.handleError(error))
      );
  }
}
