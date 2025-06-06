import { AxiosError } from 'axios';
import { Logger } from 'winston';
import { JavaApiClient, type JavaApiClientConfig } from '../java-api.client';

/**
 * Example service demonstrating how to use the Java API client
 * This service handles user-related operations with a Java backend
 */
export class UserService {
  private apiClient: JavaApiClient;

  constructor(config: JavaApiClientConfig, logger: Logger) {
    this.apiClient = new JavaApiClient(config, logger);
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string) {
    try {
      return await this.apiClient.get(`/api/users/${id}`);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof AxiosError && error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: any) {
    try {
      return await this.apiClient.post('/api/users', userData);
    } catch (error) {
      // Handle validation errors
      if (error instanceof AxiosError && error.status === 400) {
        throw new Error(`Invalid user data: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: any) {
    try {
      return await this.apiClient.put(`/api/users/${id}`, userData);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof AxiosError && error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string) {
    try {
      return await this.apiClient.delete(`/api/users/${id}`);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof AxiosError && error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
