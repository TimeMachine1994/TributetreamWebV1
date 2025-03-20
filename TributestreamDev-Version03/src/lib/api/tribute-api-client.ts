/**
 * TributeStream API Client
 * 
 * A comprehensive client library for interacting with the TributeStream WordPress API.
 * Provides typed interfaces and functions for all API operations.
 */

import { browser } from '$app/environment';

// Base API URL
const API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';

/**
 * API interface types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface FormData {
  'director-first-name': string;
  'director-last-name': string;
  'family-member-first-name': string;
  'family-member-last-name': string;
  'family-member-dob': string;
  'deceased-first-name': string;
  'deceased-last-name': string;
  'deceased-dob': string;
  'deceased-dop': string;
  'email-address': string;
  'phone-number': string;
  'location-name': string;
  'location-address': string;
  'memorial-time': string;
  'memorial-date': string;
  [key: string]: string;
}

export interface Tribute {
  id: number;
  user_id: number;
  loved_one_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
}

/**
 * API Client Class
 */
export class TributeApiClient {
  private token: string | null = null;

  /**
   * Constructor
   * 
   * @param token Optional JWT token for authentication
   */
  constructor(token?: string) {
    if (token) {
      this.token = token;
    } else if (browser) {
      // Try to get token from localStorage
      this.token = localStorage.getItem('jwt_token');
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
  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Set default headers
      options.headers = {
        ...this.getHeaders(),
        ...(options.headers || {})
      };

      // Make the request
      const response = await fetch(url, options);
      
      // Parse the response
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Unknown error occurred',
          status: response.status,
          data: data
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
        status: 0
      };
    }
  }

  /**
   * Get all tributes with pagination and search
   * 
   * @param options Pagination and search options
   * @returns List of tributes
   */
  async getTributes(options: { page?: number; perPage?: number; search?: string } = {}): Promise<ApiResponse<{ tributes: Tribute[]; total_pages: number; total_items: number; current_page: number }>> {
    const { page = 1, perPage = 10, search = '' } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    return this.request<{ tributes: Tribute[]; total_pages: number; total_items: number; current_page: number }>(
      `${API_BASE_URL}/tributes?${queryParams.toString()}`
    );
  }

  /**
   * Get tributes for a specific user
   * 
   * @param userId User ID
   * @returns User's tributes
   */
  async getTributesByUser(userId: number): Promise<ApiResponse<{ tributes: Tribute[] }>> {
    return this.request<{ tributes: Tribute[] }>(
      `${API_BASE_URL}/tributes/by-user/${userId}`
    );
  }

  /**
   * Get a tribute by ID
   * 
   * @param tributeId Tribute ID
   * @returns Tribute data
   */
  async getTributeById(tributeId: number): Promise<ApiResponse<Tribute>> {
    return this.request<Tribute>(
      `${API_BASE_URL}/tributes/${tributeId}`
    );
  }

  /**
   * Get a tribute by slug
   * 
   * @param slug Tribute slug
   * @returns Tribute data
   */
  async getTributeBySlug(slug: string): Promise<ApiResponse<Tribute>> {
    return this.request<Tribute>(
      `${API_BASE_URL}/tribute/${encodeURIComponent(slug)}`
    );
  }

  /**
   * Create a new tribute
   * 
   * @param data Tribute data
   * @returns Created tribute ID and slug
   */
  async createTribute(data: {
    user_id: number;
    loved_one_name: string;
    phone_number: string;
    slug?: string;
    custom_html?: string;
    number_of_streams?: number;
    extended_data?: Record<string, any>;
  }): Promise<ApiResponse<{ id: number; slug: string }>> {
    return this.request<{ id: number; slug: string }>(
      `${API_BASE_URL}/tributes`,
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
    data: Partial<{
      loved_one_name: string;
      slug: string;
      custom_html: string;
      phone_number: string;
      number_of_streams: number;
      extended_data: Record<string, any>;
    }>
  ): Promise<ApiResponse<{ updated_rows: number }>> {
    return this.request<{ updated_rows: number }>(
      `${API_BASE_URL}/tributes/${tributeId}`,
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
  async deleteTribute(tributeId: number): Promise<ApiResponse<{ deleted_rows: number }>> {
    return this.request<{ deleted_rows: number }>(
      `${API_BASE_URL}/tributes/${tributeId}`,
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
      `${API_BASE_URL}/tribute-data/${tributeId}`
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
      `${API_BASE_URL}/tribute-data/${tributeId}`,
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
      `${API_BASE_URL}/tribute-data/${tributeId}`,
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
  async getFormData(userId: number): Promise<ApiResponse<{ form_data: FormData }>> {
    return this.request<{ form_data: FormData }>(
      `${API_BASE_URL}/form-data/${userId}`
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
    formData: FormData,
    tributeId?: number
  ): Promise<ApiResponse<{ success: boolean }>> {
    const data: { user_id: number; form_data: FormData; tribute_id?: number } = {
      user_id: userId,
      form_data: formData
    };
    
    if (tributeId) {
      data.tribute_id = tributeId;
    }
    
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/form-data`,
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
      `${API_BASE_URL}/user-meta/${userId}`
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
      `${API_BASE_URL}/user-meta/${userId}/${encodeURIComponent(metaKey)}`
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
      `${API_BASE_URL}/user-meta`,
      {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
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
      `${API_BASE_URL}/user-meta/${userId}/${encodeURIComponent(metaKey)}`,
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
  async registerUser(data: {
    username: string;
    email: string;
    password: string;
    meta?: Record<string, any>;
  }): Promise<ApiResponse<{
    user_id: number;
    token: string;
    user_display_name: string;
    user_email: string;
  }>> {
    return this.request<{
      user_id: number;
      token: string;
      user_display_name: string;
      user_email: string;
    }>(
      `${API_BASE_URL}/register`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }
}

/**
 * Create a singleton instance for global use
 */
export const tributeApi = new TributeApiClient();

/**
 * Export default instance
 */
export default tributeApi;