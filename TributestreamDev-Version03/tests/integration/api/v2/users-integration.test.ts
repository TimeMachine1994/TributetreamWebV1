/**
 * Integration tests for the users API endpoints
 * 
 * These tests verify the interaction between different API endpoints
 * and ensure they work together correctly.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET as GetUsers, POST as CreateUser } from '../../../../src/routes/api/v2/users/+server';
import { GET as GetUserById, PUT as UpdateUser, DELETE as DeleteUser } from '../../../../src/routes/api/v2/users/[id]/+server';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  createMockAdminUser, 
  createMockCookies, 
  mockWpApiClient, 
  resetMocks, 
  setupAuthMocks 
} from '../../../unit/api/v2/setup';

// Create a mock type for the RequestEvent to avoid TypeScript errors
type MockRequestEvent = Partial<RequestEvent<Record<string, string>, string>>;

// Disable ESLint for specific lines where we need to use 'any'
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Users API Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  // Clean up after each test
  afterEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should support the full user management lifecycle', async () => {
    // Setup authentication
    const adminUser = createMockAdminUser();
    await setupAuthMocks(adminUser);
    
    // Step 1: Create a new user
    const newUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const createdUser = {
      id: 10,
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      first_name: 'Test',
      last_name: 'User'
    };
    
    // Mock WordPress API responses for create user
    mockWpApiClient.post.mockResolvedValueOnce(createdUser);
    mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
    
    // Create request object for creating a user
    const createRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users'),
      cookies: createMockCookies(),
      request: {
        json: async () => newUserData
      } as Request
    };
    
    // Execute create user
    const createResponse = await CreateUser(createRequest as any);
    const createResponseData = await createResponse.json();
    
    // Assert create user response
    expect(createResponse.status).toBe(201);
    expect(createResponseData.success).toBe(true);
    expect(createResponseData.data.id).toBe(10);
    expect(createResponseData.data.username).toBe('testuser');
    
    // Step 2: Get the created user by ID
    // Mock WordPress API responses for get user by ID
    mockWpApiClient.get.mockResolvedValueOnce(createdUser);
    mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
    
    // Create request object for getting a user by ID
    const getUserRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/10'),
      cookies: createMockCookies(),
      params: { id: '10' }
    };
    
    // Execute get user by ID
    const getUserResponse = await GetUserById(getUserRequest as any);
    const getUserResponseData = await getUserResponse.json();
    
    // Assert get user by ID response
    expect(getUserResponse.status).toBe(200);
    expect(getUserResponseData.success).toBe(true);
    expect(getUserResponseData.data.id).toBe(10);
    expect(getUserResponseData.data.username).toBe('testuser');
    expect(getUserResponseData.data.email).toBe('test@example.com');
    
    // Step 3: Update the user
    const updateUserData = {
      email: 'updated@example.com',
      name: 'Updated User',
      first_name: 'Updated',
      last_name: 'User'
    };
    
    const updatedUser = {
      id: 10,
      username: 'testuser',
      email: 'updated@example.com',
      name: 'Updated User',
      first_name: 'Updated',
      last_name: 'User'
    };
    
    // Mock WordPress API responses for update user
    mockWpApiClient.put.mockResolvedValueOnce(updatedUser);
    mockWpApiClient.get.mockResolvedValueOnce({ roles: ['subscriber'], capabilities: {} });
    
    // Create request object for updating a user
    const updateRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/10'),
      cookies: createMockCookies(),
      params: { id: '10' },
      request: {
        json: async () => updateUserData
      } as Request
    };
    
    // Execute update user
    const updateResponse = await UpdateUser(updateRequest as any);
    const updateResponseData = await updateResponse.json();
    
    // Assert update user response
    expect(updateResponse.status).toBe(200);
    expect(updateResponseData.success).toBe(true);
    expect(updateResponseData.data.id).toBe(10);
    expect(updateResponseData.data.email).toBe('updated@example.com');
    expect(updateResponseData.data.name).toBe('Updated User');
    
    // Step 4: Get all users and verify the updated user is in the list
    // Mock WordPress API responses for get all users
    mockWpApiClient.get.mockResolvedValueOnce([
      adminUser,
      updatedUser
    ]);
    mockWpApiClient.get.mockResolvedValue({ roles: ['subscriber'], capabilities: {} });
    
    // Create request object for getting all users
    const getAllUsersRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users'),
      cookies: createMockCookies()
    };
    
    // Execute get all users
    const getAllUsersResponse = await GetUsers(getAllUsersRequest as any);
    const getAllUsersResponseData = await getAllUsersResponse.json();
    
    // Assert get all users response
    expect(getAllUsersResponse.status).toBe(200);
    expect(getAllUsersResponseData.success).toBe(true);
    expect(getAllUsersResponseData.data).toHaveLength(2);
    
    // Find the updated user in the list
    const foundUser = getAllUsersResponseData.data.find((user: any) => user.id === 10);
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe('updated@example.com');
    
    // Step 5: Delete the user
    // Mock WordPress API responses for delete user
    mockWpApiClient.delete.mockResolvedValueOnce({ deleted: true, id: 10 });
    
    // Create request object for deleting a user
    const deleteRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/10'),
      cookies: createMockCookies(),
      params: { id: '10' }
    };
    
    // Execute delete user
    const deleteResponse = await DeleteUser(deleteRequest as any);
    const deleteResponseData = await deleteResponse.json();
    
    // Assert delete user response
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponseData.success).toBe(true);
    expect(deleteResponseData.data.id).toBe('10');
    
    // Step 6: Verify the user is no longer in the list
    // Mock WordPress API responses for get all users after deletion
    mockWpApiClient.get.mockResolvedValueOnce([adminUser]);
    mockWpApiClient.get.mockResolvedValue({ roles: ['administrator'], capabilities: { manage_options: true } });
    
    // Execute get all users again
    const getAllUsersAfterDeleteResponse = await GetUsers(getAllUsersRequest as any);
    const getAllUsersAfterDeleteResponseData = await getAllUsersAfterDeleteResponse.json();
    
    // Assert get all users response after deletion
    expect(getAllUsersAfterDeleteResponse.status).toBe(200);
    expect(getAllUsersAfterDeleteResponseData.success).toBe(true);
    expect(getAllUsersAfterDeleteResponseData.data).toHaveLength(1);
    
    // Verify the deleted user is not in the list
    const deletedUser = getAllUsersAfterDeleteResponseData.data.find((user: any) => user.id === 10);
    expect(deletedUser).toBeUndefined();
  });
  
  it('should handle error cases correctly throughout the lifecycle', async () => {
    // Setup authentication
    const adminUser = createMockAdminUser();
    await setupAuthMocks(adminUser);
    
    // Step 1: Try to create a user with invalid data
    const invalidUserData = {
      username: 'testuser',
      // Missing email and password
    };
    
    // Create request object for creating a user with invalid data
    const createInvalidRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users'),
      cookies: createMockCookies(),
      request: {
        json: async () => invalidUserData
      } as Request
    };
    
    // Execute create user with invalid data and expect it to fail
    await expect(CreateUser(createInvalidRequest as any)).rejects.toThrow();
    
    // Step 2: Try to get a non-existent user
    // Mock WordPress API responses for get non-existent user
    mockWpApiClient.get.mockRejectedValueOnce(new Error('User not found'));
    
    // Create request object for getting a non-existent user
    const getNonExistentUserRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/999'),
      cookies: createMockCookies(),
      params: { id: '999' }
    };
    
    // Execute get non-existent user and expect it to fail
    await expect(GetUserById(getNonExistentUserRequest as any)).rejects.toThrow();
    
    // Step 3: Try to update a non-existent user
    const updateUserData = {
      email: 'updated@example.com'
    };
    
    // Mock WordPress API responses for update non-existent user
    mockWpApiClient.put.mockRejectedValueOnce(new Error('User not found'));
    
    // Create request object for updating a non-existent user
    const updateNonExistentRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/999'),
      cookies: createMockCookies(),
      params: { id: '999' },
      request: {
        json: async () => updateUserData
      } as Request
    };
    
    // Execute update non-existent user and expect it to fail
    await expect(UpdateUser(updateNonExistentRequest as any)).rejects.toThrow();
    
    // Step 4: Try to delete a non-existent user
    // Mock WordPress API responses for delete non-existent user
    mockWpApiClient.delete.mockRejectedValueOnce(new Error('User not found'));
    
    // Create request object for deleting a non-existent user
    const deleteNonExistentRequest: MockRequestEvent = {
      url: new URL('http://localhost/api/v2/users/999'),
      cookies: createMockCookies(),
      params: { id: '999' }
    };
    
    // Execute delete non-existent user and expect it to fail
    await expect(DeleteUser(deleteNonExistentRequest as any)).rejects.toThrow();
  });
});
