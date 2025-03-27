/**
 * Users API Client
 * 
 * Provides methods for interacting with the users endpoints of the TributeStream API.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import { USERS_PATH, TRIBUTE_PAGES_PATH } from './api-constants';
import type { ApiResponse } from '$lib/server/types';
import type {
  User,
  PaginatedUsersResponse,
  PaginatedTributePagesResponse,
  CreateUserParams,
  UpdateUserParams,
  CreateUserResponse
} from '$lib/server/types';

/**
 * Users API Client
 */
export const usersApi = {
  /**
   * Get all users with pagination (admin only)
   * 
   * @param options Pagination and search options
   * @returns List of users
   */
  async getAllUsers(options: { 
    page?: number; 
    perPage?: number; 
    search?: string;
    role?: string;
  } = {}): Promise<ApiResponse<PaginatedUsersResponse>> {
    const { page = 1, perPage = 10, search = '', role = '' } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    if (role) {
      queryParams.append('role', role);
    }
    
    return tributeApiV2.request<PaginatedUsersResponse>(
      `${USERS_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Get current user information with role
   * 
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<{ data: User }>> {
    return tributeApiV2.request<{ data: User }>(
      `${USERS_PATH}/me`
    );
  },

  /**
   * Get a user by ID
   * 
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: number): Promise<ApiResponse<{ data: User }>> {
    return tributeApiV2.request<{ data: User }>(
      `${USERS_PATH}/${userId}`
    );
  },

  /**
   * Get tributes for a specific user
   * 
   * @param userId User ID
   * @param options Pagination options
   * @returns Tributes for the user
   */
  async getTributesByUser(
    userId: number, 
    options: { page?: number; perPage?: number } = {}
  ): Promise<ApiResponse<PaginatedTributePagesResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    queryParams.append('user_id', userId.toString());
    
    return tributeApiV2.request<PaginatedTributePagesResponse>(
      `${TRIBUTE_PAGES_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Create a new user (admin only)
   * 
   * @param data User data
   * @returns Created user ID
   */
  async createUser(data: CreateUserParams): Promise<ApiResponse<CreateUserResponse>> {
    return tributeApiV2.request<CreateUserResponse>(
      `${USERS_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Update an existing user
   * 
   * @param userId User ID
   * @param data Updated user data
   * @returns Update result
   */
  async updateUser(
    userId: number,
    data: UpdateUserParams
  ): Promise<ApiResponse<{ user_id: number }>> {
    return tributeApiV2.request<{ user_id: number }>(
      `${USERS_PATH}/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Delete a user (admin only)
   * 
   * @param userId User ID
   * @returns Delete result
   */
  async deleteUser(userId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${USERS_PATH}/${userId}`,
      {
        method: 'DELETE'
      }
    );
  },

  /**
   * Get all user metadata
   * 
   * @param userId User ID
   * @returns All user metadata
   */
  async getUserMeta(userId: number): Promise<ApiResponse<{ meta: Record<string, any> }>> {
    return tributeApiV2.request<{ meta: Record<string, any> }>(
      `${USERS_PATH}/${userId}/meta`
    );
  },

  /**
   * Get single user metadata entry
   * 
   * @param userId User ID
   * @param metaKey Metadata key
   * @returns Metadata value
   */
  async getUserMetaSingle(
    userId: number,
    metaKey: string
  ): Promise<ApiResponse<{ key: string; value: any }>> {
    return tributeApiV2.request<{ key: string; value: any }>(
      `${USERS_PATH}/${userId}/meta/${encodeURIComponent(metaKey)}`
    );
  },

  /**
   * Create or update user metadata
   * 
   * @param userId User ID
   * @param metaKey Metadata key
   * @param metaValue Metadata value
   * @returns Operation result
   */
  async createOrUpdateUserMeta(
    userId: number,
    metaKey: string,
    metaValue: any
  ): Promise<ApiResponse<{ success: boolean }>> {
    return tributeApiV2.request<{ success: boolean }>(
      `${USERS_PATH}/${userId}/meta`,
      {
        method: 'POST',
        body: JSON.stringify({
          meta_key: metaKey,
          meta_value: metaValue
        })
      }
    );
  },

  /**
   * Delete user metadata
   * 
   * @param userId User ID
   * @param metaKey Metadata key
   * @returns Operation result
   */
  async deleteUserMeta(
    userId: number,
    metaKey: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return tributeApiV2.request<{ success: boolean }>(
      `${USERS_PATH}/${userId}/meta/${encodeURIComponent(metaKey)}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default usersApi;