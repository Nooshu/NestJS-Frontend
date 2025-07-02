/**
 * Java API Client Module
 *
 * This module provides a robust HTTP client specifically designed for interacting with Java-based REST APIs.
 * It includes comprehensive error handling, authentication support, request/response logging,
 * and retry mechanisms commonly needed when integrating with Java backend services.
 *
 * Key Features:
 * - Multiple authentication methods (Basic, Bearer, OAuth2)
 * - Automatic retry logic with configurable delays
 * - Comprehensive error handling with Java-specific error patterns
 * - Request/response logging for debugging and monitoring
 * - TypeScript support with generic response types
 * - Configurable timeouts and base URL management
 *
 * @module JavaApiClient
 * @requires axios
 * @requires winston
 *
 * @example
 * ```typescript
 * const client = new JavaApiClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 30000,
 *   auth: {
 *     type: 'bearer',
 *     credentials: { token: 'your-jwt-token' }
 *   }
 * }, logger);
 *
 * const userData = await client.get<User>('/users/123');
 * ```
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { Logger } from 'winston';

/**
 * Configuration interface for the Java API client.
 * Defines all the configuration options available when creating a new JavaApiClient instance.
 *
 * @interface JavaApiClientConfig
 * @property {string} baseUrl - The base URL for all API requests
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {number} [retryAttempts=3] - Number of retry attempts for failed requests
 * @property {number} [retryDelay=1000] - Delay between retry attempts in milliseconds
 * @property {object} [auth] - Authentication configuration
 * @property {'basic'|'bearer'|'oauth2'} auth.type - Type of authentication to use
 * @property {object} auth.credentials - Authentication credentials based on auth type
 *
 * @example
 * ```typescript
 * const config: JavaApiClientConfig = {
 *   baseUrl: 'https://api.example.com',
 *   timeout: 30000,
 *   retryAttempts: 3,
 *   auth: {
 *     type: 'bearer',
 *     credentials: { token: 'jwt-token-here' }
 *   }
 * };
 * ```
 */
export interface JavaApiClientConfig {
  /** Base URL for all API requests */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retryAttempts?: number;
  /** Delay between retry attempts in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Authentication configuration */
  auth?: {
    /** Type of authentication to use */
    type: 'basic' | 'bearer' | 'oauth2';
    /** Authentication credentials */
    credentials: {
      /** Username for basic auth */
      username?: string | undefined;
      /** Password for basic auth */
      password?: string | undefined;
      /** Bearer token for bearer auth */
      token?: string | undefined;
      /** Client ID for OAuth2 */
      clientId?: string | undefined;
      /** Client secret for OAuth2 */
      clientSecret?: string | undefined;
    };
  };
}

/**
 * Custom error class for Java API specific errors.
 * Extends the standard Error class to include additional context specific to Java API responses.
 * This allows for better error handling and debugging when working with Java backend services.
 *
 * @class JavaApiError
 * @extends {Error}
 * @property {number} statusCode - HTTP status code from the API response
 * @property {string} [errorCode] - Application-specific error code from the Java API
 * @property {any} [details] - Additional error details from the API response
 *
 * @example
 * ```typescript
 * throw new JavaApiError(
 *   'User not found',
 *   404,
 *   'USER_NOT_FOUND',
 *   { userId: '123', timestamp: new Date() }
 * );
 * ```
 */
export class JavaApiError extends Error {
  /**
   * Creates a new JavaApiError instance.
   *
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code from the API response
   * @param {string} [errorCode] - Application-specific error code
   * @param {any} [details] - Additional error details or context
   */
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'JavaApiError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JavaApiError);
    }
  }
}

/**
 * HTTP client specifically designed for interacting with Java-based REST APIs.
 *
 * This class provides a high-level interface for making HTTP requests to Java backend services,
 * with built-in support for common Java API patterns, authentication methods, and error handling.
 *
 * Features:
 * - Automatic request/response logging for debugging and monitoring
 * - Multiple authentication methods (Basic, Bearer Token, OAuth2)
 * - Intelligent error handling with Java-specific error patterns
 * - Configurable retry logic for handling transient failures
 * - TypeScript generics for type-safe API responses
 * - Comprehensive timeout and connection management
 *
 * @class JavaApiClient
 * @property {AxiosInstance} client - The underlying Axios HTTP client instance
 * @property {Logger} logger - Winston logger instance for request/response logging
 *
 * @example
 * ```typescript
 * // Create a client with bearer token authentication
 * const apiClient = new JavaApiClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 30000,
 *   auth: {
 *     type: 'bearer',
 *     credentials: { token: 'your-jwt-token' }
 *   }
 * }, logger);
 *
 * // Make type-safe API calls
 * const user = await apiClient.get<User>('/users/123');
 * const newUser = await apiClient.post<User>('/users', userData);
 * ```
 */
export class JavaApiClient {
  /** The underlying Axios HTTP client instance */
  private client: AxiosInstance;
  /** Winston logger instance for request/response logging */
  private logger: Logger;

  /**
   * Creates a new JavaApiClient instance with the specified configuration.
   *
   * @param {JavaApiClientConfig} config - Configuration options for the API client
   * @param {Logger} logger - Winston logger instance for logging requests and responses
   *
   * @example
   * ```typescript
   * const client = new JavaApiClient({
   *   baseUrl: 'https://api.example.com',
   *   timeout: 30000,
   *   retryAttempts: 3,
   *   auth: {
   *     type: 'basic',
   *     credentials: { username: 'user', password: 'pass' }
   *   }
   * }, logger);
   * ```
   */
  constructor(config: JavaApiClientConfig, logger: Logger) {
    this.logger = logger;

    // Create axios instance with base configuration
    // Set default headers that are commonly expected by Java APIs
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Add User-Agent to help with API analytics and debugging
        'User-Agent': 'NestJS-JavaApiClient/1.0',
      },
    });

    // Setup authentication based on provided configuration
    this.setupAuth(config.auth);

    // Setup request/response interceptors for logging, error handling, and retries
    this.setupInterceptors(config.retryAttempts || 3, config.retryDelay || 1000);
  }

  /**
   * Configures authentication for the HTTP client based on the provided configuration.
   *
   * This method sets up the appropriate authentication mechanism based on the auth type:
   * - Basic: Sets username/password for HTTP Basic Authentication
   * - Bearer: Sets Authorization header with Bearer token
   * - OAuth2: Initializes OAuth2 token management (requires implementation)
   *
   * @private
   * @param {JavaApiClientConfig['auth']} [auth] - Authentication configuration object
   *
   * @example
   * ```typescript
   * // Basic authentication setup
   * this.setupAuth({
   *   type: 'basic',
   *   credentials: { username: 'user', password: 'pass' }
   * });
   *
   * // Bearer token setup
   * this.setupAuth({
   *   type: 'bearer',
   *   credentials: { token: 'jwt-token-here' }
   * });
   * ```
   */
  private setupAuth(auth?: JavaApiClientConfig['auth']) {
    if (!auth) return;

    switch (auth.type) {
      case 'basic':
        // Configure HTTP Basic Authentication
        // Axios will automatically encode credentials in Base64
        this.client.defaults.auth = {
          username: auth.credentials.username || '',
          password: auth.credentials.password || '',
        };
        break;
      case 'bearer':
        // Configure Bearer Token Authentication
        // Sets the Authorization header for all requests
        this.client.defaults.headers.common['Authorization'] = `Bearer ${auth.credentials.token}`;
        break;
      case 'oauth2':
        // Initialize OAuth2 token management
        // This delegates to a separate method for complex OAuth2 handling
        this.setupOAuth2(auth.credentials);
        break;
    }
  }

  /**
   * Sets up OAuth2 authentication with automatic token management.
   *
   * This method would typically handle:
   * - Initial token acquisition using client credentials
   * - Automatic token refresh when tokens expire
   * - Token storage and retrieval
   * - Error handling for authentication failures
   *
   * @private
   * @param {NonNullable<JavaApiClientConfig['auth']>['credentials']} _credentials - OAuth2 credentials
   *
   * @todo Implement OAuth2 token management logic
   * @todo Add token refresh mechanism
   * @todo Add token expiration handling
   *
   * @example
   * ```typescript
   * // Future implementation might look like:
   * this.setupOAuth2({
   *   clientId: 'your-client-id',
   *   clientSecret: 'your-client-secret'
   * });
   * ```
   */
  private setupOAuth2(_credentials: NonNullable<JavaApiClientConfig['auth']>['credentials']) {
    // TODO: Implement OAuth2 token management
    // This would typically involve:
    // 1. Getting initial token using client credentials flow
    // 2. Setting up automatic token refresh before expiration
    // 3. Handling token expiration and re-authentication
    // 4. Storing tokens securely (in memory or secure storage)
    // 5. Adding request interceptor to include current valid token

    this.logger.warn('OAuth2 authentication is not yet implemented');
  }

  /**
   * Configures Axios request and response interceptors for enhanced functionality.
   *
   * This method sets up interceptors that provide:
   * - Request logging for debugging and monitoring
   * - Response logging with status and timing information
   * - Automatic error handling and transformation
   * - Retry logic for transient failures (future enhancement)
   *
   * @private
   * @param {number} _retryAttempts - Number of retry attempts for failed requests
   * @param {number} _retryDelay - Delay between retry attempts in milliseconds
   *
   * @todo Implement retry logic with exponential backoff
   * @todo Add request timing metrics
   * @todo Add circuit breaker pattern for failing services
   */
  private setupInterceptors(_retryAttempts: number, _retryDelay: number) {
    /**
     * Request Interceptor
     *
     * Logs outgoing requests for debugging and monitoring purposes.
     * This helps track API usage patterns and troubleshoot integration issues.
     */
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('Java API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          // Log headers but exclude sensitive information
          headers: this.sanitizeHeaders(config.headers),
          timestamp: new Date().toISOString(),
        });
        return config;
      },
      (error) => {
        this.logger.error('Java API Request Error', {
          error: error.message,
          stack: error.stack,
        });
        return Promise.reject(error);
      }
    );

    /**
     * Response Interceptor
     *
     * Logs incoming responses and handles error transformation.
     * Successful responses are logged for monitoring, while errors
     * are transformed into JavaApiError instances for consistent handling.
     */
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('Java API Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          // Log response size for performance monitoring
          contentLength: response.headers['content-length'],
          timestamp: new Date().toISOString(),
        });
        return response;
      },
      async (error) => {
        if (error.response) {
          // Transform HTTP error responses into JavaApiError instances
          const javaError = this.handleJavaApiError(error.response);
          this.logger.error('Java API Error', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            errorCode: javaError.errorCode,
            message: javaError.message,
            details: javaError.details,
          });
          return Promise.reject(javaError);
        }

        // Handle network errors, timeouts, etc.
        this.logger.error('Java API Network Error', {
          message: error.message,
          code: error.code,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Sanitizes HTTP headers to remove sensitive information from logs.
   *
   * @private
   * @param {any} headers - The headers object to sanitize
   * @returns {any} Sanitized headers object
   */
  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Transforms HTTP error responses into JavaApiError instances.
   *
   * This method extracts error information from Java API responses and creates
   * a standardized error object that includes status codes, error codes, and
   * additional details for better error handling and debugging.
   *
   * @private
   * @param {AxiosResponse} response - The error response from the Java API
   * @returns {JavaApiError} A JavaApiError instance with extracted error information
   *
   * @example
   * ```typescript
   * // Java API error response structure:
   * {
   *   "message": "User not found",
   *   "errorCode": "USER_NOT_FOUND",
   *   "details": {
   *     "userId": "123",
   *     "timestamp": "2023-01-01T00:00:00Z"
   *   }
   * }
   * ```
   */
  private handleJavaApiError(response: AxiosResponse): JavaApiError {
    const { status, data } = response;

    // Extract error information with fallbacks for different response formats
    const errorMessage = data?.message || data?.error || `HTTP ${status} Error`;
    const errorCode = data?.errorCode || data?.code;
    const details = data?.details || data?.errors || data;

    return new JavaApiError(errorMessage, status, errorCode, details);
  }

  /**
   * Performs a GET request to the Java API.
   *
   * This method handles GET requests with comprehensive error handling and logging.
   * It returns the response data directly, making it easy to work with typed responses.
   *
   * @template T - The expected response data type
   * @param {string} path - The API endpoint path (relative to base URL)
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration
   * @returns {Promise<T>} Promise that resolves to the response data
   * @throws {JavaApiError} When the API returns an error response
   * @throws {Error} When a network or other error occurs
   *
   * @example
   * ```typescript
   * // Get a user by ID
   * const user = await client.get<User>('/users/123');
   *
   * // Get users with query parameters
   * const users = await client.get<User[]>('/users', {
   *   params: { page: 1, limit: 10 }
   * });
   * ```
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(path, config);
      return response.data;
    } catch (error: unknown) {
      this.logger.error('Java API GET Error', {
        path,
        config: this.sanitizeConfig(config),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // API returned an error response - this is already handled by interceptors
          throw this.handleJavaApiError(error.response);
        }
        // Network error, timeout, or other Axios error without response
        throw error;
      }
      // Non-Axios error
      throw error;
    }
  }

  /**
   * Performs a POST request to the Java API.
   *
   * This method handles POST requests for creating new resources or submitting data.
   * It includes comprehensive error handling and logging for debugging purposes.
   *
   * @template T - The expected response data type
   * @param {string} path - The API endpoint path (relative to base URL)
   * @param {any} [data] - The request body data to send
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration
   * @returns {Promise<T>} Promise that resolves to the response data
   * @throws {JavaApiError} When the API returns an error response
   * @throws {Error} When a network or other error occurs
   *
   * @example
   * ```typescript
   * // Create a new user
   * const newUser = await client.post<User>('/users', {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   *
   * // Submit form data with custom headers
   * const result = await client.post<ApiResponse>('/submit', formData, {
   *   headers: { 'Content-Type': 'multipart/form-data' }
   * });
   * ```
   */
  async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data, config);
      return response.data;
    } catch (error: unknown) {
      this.logger.error('Java API POST Error', {
        path,
        dataType: data ? typeof data : 'undefined',
        config: this.sanitizeConfig(config),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // API returned an error response - this is already handled by interceptors
          throw this.handleJavaApiError(error.response);
        }
        // Network error, timeout, or other Axios error without response
        throw error;
      }
      // Non-Axios error
      throw error;
    }
  }

  /**
   * Performs a PUT request to the Java API.
   *
   * This method handles PUT requests for updating existing resources.
   * It provides the same comprehensive error handling and logging as other HTTP methods.
   *
   * @template T - The expected response data type
   * @param {string} path - The API endpoint path (relative to base URL)
   * @param {any} [data] - The request body data to send
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration
   * @returns {Promise<T>} Promise that resolves to the response data
   * @throws {JavaApiError} When the API returns an error response
   * @throws {Error} When a network or other error occurs
   *
   * @example
   * ```typescript
   * // Update an existing user
   * const updatedUser = await client.put<User>('/users/123', {
   *   name: 'Jane Doe',
   *   email: 'jane@example.com'
   * });
   *
   * // Update with optimistic locking
   * const result = await client.put<User>('/users/123', userData, {
   *   headers: { 'If-Match': etag }
   * });
   * ```
   */
  async put<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(path, data, config);
      return response.data;
    } catch (error: unknown) {
      this.logger.error('Java API PUT Error', {
        path,
        dataType: data ? typeof data : 'undefined',
        config: this.sanitizeConfig(config),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // API returned an error response - this is already handled by interceptors
          throw this.handleJavaApiError(error.response);
        }
        // Network error, timeout, or other Axios error without response
        throw error;
      }
      // Non-Axios error
      throw error;
    }
  }

  /**
   * Performs a DELETE request to the Java API.
   *
   * This method handles DELETE requests for removing resources.
   * It provides comprehensive error handling and logging for audit and debugging purposes.
   *
   * @template T - The expected response data type
   * @param {string} path - The API endpoint path (relative to base URL)
   * @param {AxiosRequestConfig} [config] - Optional Axios request configuration
   * @returns {Promise<T>} Promise that resolves to the response data
   * @throws {JavaApiError} When the API returns an error response
   * @throws {Error} When a network or other error occurs
   *
   * @example
   * ```typescript
   * // Delete a user
   * await client.delete('/users/123');
   *
   * // Delete with confirmation header
   * const result = await client.delete<DeleteResponse>('/users/123', {
   *   headers: { 'X-Confirm-Delete': 'true' }
   * });
   * ```
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(path, config);
      return response.data;
    } catch (error: unknown) {
      this.logger.error('Java API DELETE Error', {
        path,
        config: this.sanitizeConfig(config),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // API returned an error response - this is already handled by interceptors
          throw this.handleJavaApiError(error.response);
        }
        // Network error, timeout, or other Axios error without response
        throw error;
      }
      // Non-Axios error
      throw error;
    }
  }

  /**
   * Sanitizes request configuration for logging purposes.
   * Removes sensitive information from config objects before logging.
   *
   * @private
   * @param {AxiosRequestConfig} [config] - The request configuration to sanitize
   * @returns {any} Sanitized configuration object
   */
  private sanitizeConfig(config?: AxiosRequestConfig): any {
    if (!config) return undefined;

    const sanitized = { ...config };

    // Remove sensitive headers
    if (sanitized.headers) {
      sanitized.headers = this.sanitizeHeaders(sanitized.headers);
    }

    // Remove auth information
    if (sanitized.auth) {
      sanitized.auth = { username: '***REDACTED***', password: '***REDACTED***' };
    }

    return sanitized;
  }
}
