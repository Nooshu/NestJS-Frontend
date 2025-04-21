import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from 'winston';

/**
 * Configuration interface for the Java API client
 */
export interface JavaApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  auth?: {
    type: 'basic' | 'bearer' | 'oauth2';
    credentials: {
      username?: string;
      password?: string;
      token?: string;
      clientId?: string;
      clientSecret?: string;
    };
  };
}

/**
 * Error class for Java API specific errors
 */
export class JavaApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'JavaApiError';
  }
}

/**
 * Client for interacting with Java-based REST APIs
 * Handles common Java API patterns and authentication methods
 */
export class JavaApiClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(config: JavaApiClientConfig, logger: Logger) {
    this.logger = logger;
    
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Setup authentication
    this.setupAuth(config.auth);

    // Setup interceptors
    this.setupInterceptors(config.retryAttempts || 3, config.retryDelay || 1000);
  }

  /**
   * Setup authentication based on the provided configuration
   */
  private setupAuth(auth?: JavaApiClientConfig['auth']) {
    if (!auth) return;

    switch (auth.type) {
      case 'basic':
        this.client.defaults.auth = {
          username: auth.credentials.username || '',
          password: auth.credentials.password || ''
        };
        break;
      case 'bearer':
        this.client.defaults.headers.common['Authorization'] = `Bearer ${auth.credentials.token}`;
        break;
      case 'oauth2':
        // Implement OAuth2 token management
        this.setupOAuth2(auth.credentials);
        break;
    }
  }

  /**
   * Setup OAuth2 authentication with token management
   */
  private setupOAuth2(credentials: NonNullable<JavaApiClientConfig['auth']>['credentials']) {
    // Implement OAuth2 token management
    // This would typically involve:
    // 1. Getting initial token
    // 2. Setting up token refresh
    // 3. Handling token expiration
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(retryAttempts: number, retryDelay: number) {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('Java API Request', {
          method: config.method,
          url: config.url,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        this.logger.error('Java API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('Java API Response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      async (error) => {
        if (error.response) {
          // Handle Java API specific error responses
          const javaError = this.handleJavaApiError(error.response);
          this.logger.error('Java API Error', javaError);
          return Promise.reject(javaError);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle Java API specific error responses
   */
  private handleJavaApiError(response: AxiosResponse): JavaApiError {
    const { status, data } = response;
    const errorMessage = data.message || 'Unknown error occurred';
    const errorCode = data.errorCode;
    const details = data.details;

    return new JavaApiError(errorMessage, status, errorCode, details);
  }

  /**
   * Make a GET request to the Java API
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(path, config);
      return response.data;
    } catch (error) {
      this.logger.error('Java API GET Error', { path, error });
      throw error;
    }
  }

  /**
   * Make a POST request to the Java API
   */
  async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data, config);
      return response.data;
    } catch (error) {
      this.logger.error('Java API POST Error', { path, error });
      throw error;
    }
  }

  /**
   * Make a PUT request to the Java API
   */
  async put<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(path, data, config);
      return response.data;
    } catch (error) {
      this.logger.error('Java API PUT Error', { path, error });
      throw error;
    }
  }

  /**
   * Make a DELETE request to the Java API
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(path, config);
      return response.data;
    } catch (error) {
      this.logger.error('Java API DELETE Error', { path, error });
      throw error;
    }
  }
} 