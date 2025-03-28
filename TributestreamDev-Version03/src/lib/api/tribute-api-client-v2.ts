/**
 * TributeStream API Client (V2)
 * 
 * A comprehensive client library for interacting with the TributeStream API.
 * This version is updated to work with the new API endpoints.
 */

import { browser } from '$app/environment';
import {
  API_BASE_URL,
  TRIBUTE_PAGES_PATH,
  TRIBUTE_BY_SLUG_PATH,
  AUTH_TOKEN_PATH,
  AUTH_VALIDATE_PATH,
  AUTH_REGISTER_PATH,
  USERS_PATH
} from './api-constants';
import type {
  ApiResponse,
  TributePage,
  CreateTributePageParams,
  UpdateTributePageParams,
  PaginatedTributePagesResponse,
  CreateTributePageResponse,
  UserRegistrationRequest,
  AuthTokenResponse
} from '$lib/server/types';

/**
 * API Client Class
 */
export class TributeApiClientV2 {
  private token: string | null = null;
  private customFetch: typeof fetch | null = null;

  /**
   * Constructor
   *
   * @param token Optional JWT token for authentication
   * @param customFetch Optional fetch function to use (for server-side requests)
   */
  constructor(token?: string, customFetch?: typeof fetch) {
    if (token) {
      this.token = token;
    } else if (browser) {
      // Try to get token from localStorage
      this.token = localStorage.getItem('jwt_token');
    }
    
    if (customFetch) {
      this.customFetch = customFetch;
    }
  }

  /**
   * Set authentication token
   *
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
    if (browser) {
      localStorage.setItem('jwt_token', token);
    }
  }

  /**
   * Set custom fetch function
   *
   * @param fetchFn Custom fetch function (e.g., event.fetch in SvelteKit server-side code)
   */
  setFetch(fetchFn: typeof fetch): void {
    this.customFetch = fetchFn;
  }

  /**
   * Get the current fetch function
   *
   * @returns The current fetch function being used
   */
  getFetch(): typeof fetch {
    return this.customFetch || fetch;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    if (browser) {
      localStorage.removeItem('jwt_token');
    }
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Execute API request with error handling
   * 
   * @param url API endpoint URL
   * @param options Fetch options
   * @returns Response data or error
   */
  async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Set default headers
      options.headers = {
        ...this.getHeaders(),
        ...(options.headers || {})
      };

      // Use custom fetch if provided, otherwise use global fetch
      const fetchFn = this.customFetch || fetch;
      
      // Log the request details for debugging
      console.log(`API Request: ${url}`);
      console.log(`Using custom fetch: ${!!this.customFetch}`);
      console.log(`Is URL relative: ${url.startsWith('/')}`);
      console.log(`Request options:`, options);
      
      // Make the request
      let response;
      try {
        // For relative URLs, ensure we're using the custom fetch function
        // This is critical for server-side rendering with SvelteKit
        if (url.startsWith('/')) {
          if (!this.customFetch) {
            console.error(`Error: Cannot use relative URL (${url}) with global fetch. Use event.fetch instead.`);
            throw new Error(`Cannot use relative URL (${url}) with global fetch — use event.fetch instead: https://svelte.dev/docs/kit/web-standards#fetch-apis`);
          }
          console.log(`Using custom fetch for relative URL: ${url}`);
        }
        
        response = await fetchFn(url, options);
        console.log(`Response status: ${response.status}`);
      } catch (fetchError) {
        console.error(`Fetch error:`, fetchError);
        console.error(`Fetch error details:`, {
          url,
          isRelative: url.startsWith('/'),
          usingCustomFetch: !!this.customFetch
        });
        throw fetchError;
      }
      
      // Parse the response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Received JSON response:', JSON.stringify(data).substring(0, 200) + '...');
      } else {
        // Handle non-JSON responses (like HTML)
        const textData = await response.text();
        
        // Check if it's HTML (likely a login page or error page)
        if (textData.includes('<!doctype html>') || textData.includes('<html')) {
          console.error('Received HTML response instead of JSON. Authentication may have failed.');
          console.error('Response URL:', response.url);
          console.error('Response status:', response.status);
          console.error('Response headers:', JSON.stringify(Object.fromEntries([...response.headers])));
          console.error('HTML preview:', textData.substring(0, 200) + '...');
          
          return {
            success: false,
            error: 'Authentication failed or invalid endpoint. Received HTML instead of JSON.',
            code: 'AUTH_ERROR',
            status: response.status,
            htmlPreview: textData.substring(0, 200) + '...'
          };
        }
        
        console.log('Received non-JSON response:', textData.substring(0, 200) + '...');
        data = textData;
      }

      // Handle error responses
      if (!response.ok) {
        return {
          success: false,
          error: typeof data === 'object' ? (data.message || data.error || 'Unknown error occurred') : 'API error: ' + String(data).substring(0, 100),
          code: typeof data === 'object' ? (data.code || 'API_ERROR') : 'API_ERROR',
          status: response.status
        };
      }

      // Return successful response
      return {
        success: true,
        data: data as T,
        status: response.status
      };
    } catch (error) {
      // Handle network errors
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
        status: 0
      };
    }
  }

  /**
   * Get tributes with pagination and search
   * 
   * @param options Pagination and search options
   * @returns List of tributes
   */
  async getTributes(options: { page?: number; perPage?: number; search?: string; userId?: number } = {}): Promise<ApiResponse<PaginatedTributePagesResponse>> {
    const { page = 1, perPage = 10, search = '', userId } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }

    if (userId) {
      queryParams.append('user_id', userId.toString());
    }
    
    // Enhanced logging to debug fetch issues
    console.log('getTributes options:', options);
    console.log('getTributes URL:', `${TRIBUTE_PAGES_PATH}?${queryParams.toString()}`);
    console.log('Using custom fetch:', !!this.customFetch);
    
    try {
      // Use the request method which should use the custom fetch if set
      const response = await this.request<PaginatedTributePagesResponse>(
        `${TRIBUTE_PAGES_PATH}?${queryParams.toString()}`
      );
      
      console.log('getTributes raw response:', response);
      
      return response;
    } catch (error) {
      console.error('Error in getTributes:', error);
      return {
        success: false,
        error: `Failed to fetch tributes: ${error}`,
        code: 'FETCH_ERROR'
      };
    }
  }

  /**
   * Get tributes for a specific user
   * 
   * @param userId User ID
   * @returns User's tributes
   */
  async getTributesByUser(userId: number): Promise<ApiResponse<PaginatedTributePagesResponse>> {
    console.log('getTributesByUser called with userId:', userId);
    console.log('Using custom fetch in getTributesByUser:', !!this.customFetch);
    
    try {
      // Directly call getTributes with the userId
      const response = await this.getTributes({ userId });
      
      // Log detailed response information
      console.log('getTributesByUser response status:', response.success);
      if (!response.success) {
        console.error('getTributesByUser error:', response.error);
      } else {
        console.log('getTributesByUser data structure:',
          response.data ? Object.keys(response.data).join(', ') : 'No data');
      }
      
      return response;
    } catch (error) {
      console.error('Error in getTributesByUser:', error);
      return {
        success: false,
        error: `Failed to fetch tributes for user ${userId}: ${error}`,
        code: 'FETCH_ERROR'
      };
    }
  }

  /**
   * Get a tribute by ID
   * 
   * @param tributeId Tribute ID
   * @returns Tribute data
   */
  async getTributeById(tributeId: number): Promise<ApiResponse<{ data: TributePage }>> {
    console.log(`getTributeById called with tributeId: ${tributeId}`);
    console.log(`Using custom fetch in getTributeById: ${!!this.customFetch}`);
    
    try {
      const url = `${TRIBUTE_PAGES_PATH}/${tributeId}`;
      console.log(`getTributeById URL: ${url}`);
      
      const response = await this.request<{ data: TributePage }>(url);
      
      console.log(`getTributeById response status: ${response.success}`);
      if (!response.success) {
        console.error(`getTributeById error: ${response.error}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Error in getTributeById: ${error}`);
      return {
        success: false,
        error: `Failed to fetch tribute ${tributeId}: ${error}`,
        code: 'FETCH_ERROR'
      };
    }
  }

  /**
   * Get a tribute by slug
   * 
   * @param slug Tribute slug
   * @returns Tribute data
   */
  async getTributeBySlug(slug: string): Promise<ApiResponse<{ data: TributePage }>> {
    return this.request<{ data: TributePage }>(
      `${TRIBUTE_BY_SLUG_PATH}/${encodeURIComponent(slug)}`
    );
  }

  /**
   * Create a new tribute
   * 
   * @param data Tribute data
   * @returns Created tribute ID and slug
   */
  async createTribute(data: CreateTributePageParams): Promise<ApiResponse<CreateTributePageResponse>> {
    return this.request<CreateTributePageResponse>(
      `${TRIBUTE_PAGES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update an existing tribute
   * 
   * @param tributeId Tribute ID
   * @param data Updated tribute data
   * @returns Update result
   */
  async updateTribute(
    tributeId: number,
    data: UpdateTributePageParams
  ): Promise<ApiResponse<{ tribute_id: number; slugified_name?: string }>> {
    return this.request<{ tribute_id: number; slugified_name?: string }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Delete a tribute
   * 
   * @param tributeId Tribute ID
   * @returns Delete result
   */
  async deleteTribute(tributeId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}`,
      {
        method: 'DELETE'
      }
    );
  }

  /**
   * Get extended tribute data
   * 
   * @param tributeId Tribute ID
   * @returns Extended data
   */
  async getTributeData(tributeId: number): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/data`
    );
  }

  /**
   * Create or replace extended tribute data
   * 
   * @param tributeId Tribute ID
   * @param data Extended data
   * @returns Operation result
   */
  async createOrReplaceTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/data`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update extended tribute data (partial update)
   * 
   * @param tributeId Tribute ID
   * @param data Extended data to merge
   * @returns Operation result
   */
  async updateTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/data`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Get form data for a user
   * 
   * @param userId User ID
   * @returns Form data
   */
  async getFormData(userId: number): Promise<ApiResponse<{ form_data: Record<string, string> }>> {
    return this.request<{ form_data: Record<string, string> }>(
      `${API_BASE_URL}/forms/${userId}`
    );
  }

  /**
   * Save form data for a user
   * 
   * @param userId User ID
   * @param formData Form data
   * @param tributeId Optional tribute ID to update
   * @returns Operation result
   */
  async saveFormData(
    userId: number,
    formData: Record<string, string>,
    tributeId?: number
  ): Promise<ApiResponse<{ success: boolean }>> {
    const data: { user_id: number; form_data: Record<string, string>; tribute_id?: number } = {
      user_id: userId,
      form_data: formData
    };
    
    if (tributeId) {
      data.tribute_id = tributeId;
    }
    
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/forms`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Get all user metadata
   * 
   * @param userId User ID
   * @returns All user metadata
   */
  async getUserMeta(userId: number): Promise<ApiResponse<{ meta: Record<string, any> }>> {
    return this.request<{ meta: Record<string, any> }>(
      `${USERS_PATH}/${userId}/meta`
    );
  }

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
    return this.request<{ key: string; value: any }>(
      `${USERS_PATH}/${userId}/meta/${encodeURIComponent(metaKey)}`
    );
  }

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
    return this.request<{ success: boolean }>(
      `${USERS_PATH}/${userId}/meta`,
      {
        method: 'POST',
        body: JSON.stringify({
          meta_key: metaKey,
          meta_value: metaValue
        })
      }
    );
  }

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
    return this.request<{ success: boolean }>(
      `${USERS_PATH}/${userId}/meta/${encodeURIComponent(metaKey)}`,
      {
        method: 'DELETE'
      }
    );
  }

  /**
   * Register a new user
   * 
   * @param data User registration data
   * @returns Registration result with user information and JWT token
   */
  async registerUser(data: UserRegistrationRequest): Promise<ApiResponse<AuthTokenResponse>> {
    return this.request<AuthTokenResponse>(
      AUTH_REGISTER_PATH,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Login user and get JWT token
   * 
   * @param username Username or email
   * @param password User password
   * @returns Authentication token and user information
   */
  async login(username: string, password: string): Promise<ApiResponse<AuthTokenResponse>> {
    return this.request<AuthTokenResponse>(
      AUTH_TOKEN_PATH,
      {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }
    );
  }

  /**
   * Validate JWT token
   * 
   * @returns Validation result
   */
  async validateToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>(
      AUTH_VALIDATE_PATH
    );
  }
}

/**
 * Create a singleton instance for global use
 */
export const tributeApiV2 = new TributeApiClientV2();

/**
 * Export default instance
 */
export default tributeApiV2;