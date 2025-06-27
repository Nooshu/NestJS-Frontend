import { AxiosError } from 'axios';
import { Logger } from 'winston';
import { JavaApiClient, JavaApiClientConfig } from '../java-api.client';
import { UserService } from './user.service';

// Mock the JavaApiClient
jest.mock('../java-api.client');

describe('UserService', () => {
  let userService: UserService;
  let mockApiClient: jest.Mocked<JavaApiClient>;
  let mockLogger: jest.Mocked<Logger>;
  let config: JavaApiClientConfig;

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

    // Setup mock API client
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<JavaApiClient>;

    // Mock the JavaApiClient constructor
    (JavaApiClient as jest.MockedClass<typeof JavaApiClient>).mockImplementation(() => mockApiClient);

    // Default config
    config = {
      baseUrl: 'https://api.example.gov.uk',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    userService = new UserService(config, mockLogger);
  });

  describe('constructor', () => {
    it('should create a new JavaApiClient with the provided config and logger', () => {
      expect(JavaApiClient).toHaveBeenCalledWith(config, mockLogger);
      expect(JavaApiClient).toHaveBeenCalledTimes(1);
    });

    it('should store the API client instance', () => {
      expect(userService).toBeInstanceOf(UserService);
    });
  });

  describe('getUserById', () => {
    const userId = '123';
    const mockUserData = { id: userId, name: 'John Doe', email: 'john@example.com' };

    it('should successfully get a user by ID', async () => {
      mockApiClient.get.mockResolvedValue(mockUserData);

      const result = await userService.getUserById(userId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${userId}`);
      expect(result).toEqual(mockUserData);
    });

    it('should handle 404 error and throw user not found error', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 404;

      mockApiClient.get.mockRejectedValue(axiosError);

      await expect(userService.getUserById(userId)).rejects.toThrow(`User with ID ${userId} not found`);
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should re-throw non-404 AxiosError', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 500;
      axiosError.message = 'Internal Server Error';

      mockApiClient.get.mockRejectedValue(axiosError);

      await expect(userService.getUserById(userId)).rejects.toThrow(axiosError);
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should re-throw non-AxiosError exceptions', async () => {
      const genericError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(genericError);

      await expect(userService.getUserById(userId)).rejects.toThrow('Network error');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should handle other error types from the client', async () => {
      const otherError = new Error('Some other error');
      mockApiClient.get.mockRejectedValue(otherError);

      await expect(userService.getUserById(userId)).rejects.toThrow('Some other error');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should handle empty string user ID', async () => {
      mockApiClient.get.mockResolvedValue(mockUserData);

      const result = await userService.getUserById('');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/');
      expect(result).toEqual(mockUserData);
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user-123_test@example';
      mockApiClient.get.mockResolvedValue(mockUserData);

      const result = await userService.getUserById(specialUserId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/users/${specialUserId}`);
      expect(result).toEqual(mockUserData);
    });
  });

  describe('createUser', () => {
    const userData = { name: 'Jane Doe', email: 'jane@example.com' };
    const mockCreatedUser = { id: '456', ...userData };

    it('should successfully create a user', async () => {
      mockApiClient.post.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', userData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle 400 error and throw validation error', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 400;
      axiosError.message = 'Validation failed';

      mockApiClient.post.mockRejectedValue(axiosError);

      await expect(userService.createUser(userData)).rejects.toThrow('Invalid user data: Validation failed');
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', userData);
    });

    it('should re-throw non-400 AxiosError', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 500;
      axiosError.message = 'Internal Server Error';

      mockApiClient.post.mockRejectedValue(axiosError);

      await expect(userService.createUser(userData)).rejects.toThrow(axiosError);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', userData);
    });

    it('should re-throw non-AxiosError exceptions', async () => {
      const genericError = new Error('Network error');
      mockApiClient.post.mockRejectedValue(genericError);

      await expect(userService.createUser(userData)).rejects.toThrow('Network error');
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', userData);
    });

    it('should handle empty user data', async () => {
      const emptyUserData = {};
      mockApiClient.post.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(emptyUserData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', emptyUserData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle null user data', async () => {
      mockApiClient.post.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(null as any);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', null);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle complex user data objects', async () => {
      const complexUserData = {
        name: 'Complex User',
        email: 'complex@example.com',
        address: {
          street: '123 Main St',
          city: 'London',
          postcode: 'SW1A 1AA'
        },
        preferences: {
          notifications: true,
          theme: 'dark'
        }
      };
      mockApiClient.post.mockResolvedValue({ id: '789', ...complexUserData });

      const result = await userService.createUser(complexUserData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users', complexUserData);
      expect(result).toEqual({ id: '789', ...complexUserData });
    });
  });

  describe('updateUser', () => {
    const userId = '123';
    const userData = { name: 'Updated Name', email: 'updated@example.com' };
    const mockUpdatedUser = { id: userId, ...userData };

    it('should successfully update a user', async () => {
      mockApiClient.put.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId, userData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/users/${userId}`, userData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle 404 error and throw user not found error', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 404;

      mockApiClient.put.mockRejectedValue(axiosError);

      await expect(userService.updateUser(userId, userData)).rejects.toThrow(`User with ID ${userId} not found`);
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/users/${userId}`, userData);
    });

    it('should re-throw non-404 AxiosError', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 500;
      axiosError.message = 'Internal Server Error';

      mockApiClient.put.mockRejectedValue(axiosError);

      await expect(userService.updateUser(userId, userData)).rejects.toThrow(axiosError);
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/users/${userId}`, userData);
    });

    it('should re-throw non-AxiosError exceptions', async () => {
      const genericError = new Error('Network error');
      mockApiClient.put.mockRejectedValue(genericError);

      await expect(userService.updateUser(userId, userData)).rejects.toThrow('Network error');
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/users/${userId}`, userData);
    });

    it('should handle partial user data updates', async () => {
      const partialUserData = { name: 'Partial Update' };
      mockApiClient.put.mockResolvedValue({ id: userId, ...partialUserData });

      const result = await userService.updateUser(userId, partialUserData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/users/${userId}`, partialUserData);
      expect(result).toEqual({ id: userId, ...partialUserData });
    });

    it('should handle empty string user ID', async () => {
      mockApiClient.put.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser('', userData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/', userData);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    const userId = '123';
    const mockDeleteResponse = { success: true, message: 'User deleted successfully' };

    it('should successfully delete a user', async () => {
      mockApiClient.delete.mockResolvedValue(mockDeleteResponse);

      const result = await userService.deleteUser(userId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/users/${userId}`);
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle 404 error and throw user not found error', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 404;

      mockApiClient.delete.mockRejectedValue(axiosError);

      await expect(userService.deleteUser(userId)).rejects.toThrow(`User with ID ${userId} not found`);
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should re-throw non-404 AxiosError', async () => {
      const axiosError = new AxiosError();
      axiosError.status = 500;
      axiosError.message = 'Internal Server Error';

      mockApiClient.delete.mockRejectedValue(axiosError);

      await expect(userService.deleteUser(userId)).rejects.toThrow(axiosError);
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should re-throw non-AxiosError exceptions', async () => {
      const genericError = new Error('Network error');
      mockApiClient.delete.mockRejectedValue(genericError);

      await expect(userService.deleteUser(userId)).rejects.toThrow('Network error');
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/users/${userId}`);
    });

    it('should handle empty string user ID', async () => {
      mockApiClient.delete.mockResolvedValue(mockDeleteResponse);

      const result = await userService.deleteUser('');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/users/');
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user-123_test@example';
      mockApiClient.delete.mockResolvedValue(mockDeleteResponse);

      const result = await userService.deleteUser(specialUserId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/users/${specialUserId}`);
      expect(result).toEqual(mockDeleteResponse);
    });
  });

  describe('error handling consistency', () => {
    it('should handle non-AxiosError exceptions consistently', async () => {
      const genericError = new Error('Generic error');
      mockApiClient.get.mockRejectedValue(genericError);

      await expect(userService.getUserById('123')).rejects.toThrow('Generic error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockApiClient.get.mockRejectedValue(networkError);

      await expect(userService.getUserById('123')).rejects.toThrow('Network timeout');
    });
  });

  describe('method parameter validation', () => {
    it('should handle undefined parameters gracefully', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await userService.getUserById(undefined as any);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/undefined');
      expect(result).toEqual({});
    });

    it('should handle null parameters gracefully', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await userService.getUserById(null as any);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/null');
      expect(result).toEqual({});
    });
  });
}); 