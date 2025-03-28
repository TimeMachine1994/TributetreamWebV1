/**
 * TributeStream API Client
 * 
 * A comprehensive client library for interacting with the TributeStream WordPress API.
 * Provides typed interfaces and functions for all API operations.
 */

import { browser } from '$app/environment';
import { API_BASE_URL } from './api-constants';

/**
 * API interface types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
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

export interface TributeCollection {
  tributes: Tribute[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

export interface TributeCreationResult {
  id: number;
  slug: string;
}

export interface TributeApiClient {
  setToken(token: string): void;
  clearToken(): void;
  getAllTributes(options?: { page?: number; perPage?: number; search?: string }): Promise<ApiResponse<TributeCollection>>;
  getTributeById(tributeId: number): Promise<ApiResponse<Tribute>>;
  getTributeBySlug(slug: string): Promise<ApiResponse<Tribute>>;
  createTribute(data: any): Promise<ApiResponse<TributeCreationResult>>;
  updateTribute(tributeId: number, data: any): Promise<ApiResponse<{ updated_rows: number }>>;
  deleteTribute(tributeId: number): Promise<ApiResponse<{ deleted_rows: number }>>;
  getTributeData(tributeId: number): Promise<ApiResponse<Record<string, any>>>;
  createTributeData(tributeId: number, data: Record<string, any>): Promise<ApiResponse<{ success: boolean }>>;
  updateTributeData(tributeId: number, data: Record<string, any>): Promise<ApiResponse<{ success: boolean }>>;
  saveFormData(data: FormData): Promise<ApiResponse<{ success: boolean }>>;
  getFormData(userId: number): Promise<ApiResponse<FormData>>;
}

/**
 * TributeStream API Client
 */
export class TributeApiClientImpl implements TributeApiClient {
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
   * Set the JWT token for authenticated requests
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
   * Clear the JWT token
   */
  clearToken(): void {
    this.token = null;
    if (browser) {
      localStorage.removeItem('jwt_token');
    }
  }

  /**
   * Get request headers with authentication
   * 
   * @returns Headers object
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
  protected async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
          error: data.message || data.error || 'Unknown error occurred',
          code: data.code || 'API_ERROR',
          status: response.status
        };
      }

      // Return successful response
      return {
        success: true,
        data: data,
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
   * Get all tributes with pagination
   * 
   * @param options Pagination options
   * @returns List of tributes
   */
  async getAllTributes(options: { page?: number; perPage?: number; search?: string } = {}): Promise<ApiResponse<TributeCollection>> {
    const { page = 1, perPage = 10, search = '' } = options;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const response = await this.request<{ data: { tributes: any[]; total_items: number; total_pages: number; current_page: number } }>(
      `${API_BASE_URL}/tribute-pages?${queryParams.toString()}`
    );
    
    // Map the new API response format to the old format for backward compatibility
    if (response.success && response.data?.data) {
      const { tributes, total_items, total_pages, current_page } = response.data.data;
      
      const mappedTributes = tributes.map(tribute => ({
        id: tribute.tribute_id,
        user_id: tribute.created_by_user_id,
        loved_one_name: tribute.loved_ones_name,
        slug: tribute.slugified_name,
        created_at: new Date().toISOString(), // Default value as this isn't in the new API
        updated_at: new Date().toISOString(), // Default value as this isn't in the new API
        custom_html: tribute.page_html || '',
        phone_number: '', // Default value as this isn't in the new API
        number_of_streams: 0 // Default value as this isn't in the new API
      }));
      
      return {
        ...response,
        data: {
          tributes: mappedTributes,
          total_pages,
          total_items,
          current_page
        }
      };
    }
    
    return {
      ...response,
      data: {
        tributes: [],
        total_pages: 0,
        total_items: 0,
        current_page: 1
      }
    } as ApiResponse<TributeCollection>;
  }

  /**
   * Get a tribute by ID
   * 
   * @param tributeId Tribute ID
   * @returns Tribute data
   */
  async getTributeById(tributeId: number): Promise<ApiResponse<Tribute>> {
    const response = await this.request<{ data: any }>(
      `${API_BASE_URL}/tribute-pages/${tributeId}`
    );
    
    // Map the new API response format to the old format for backward compatibility
    if (response.success && response.data?.data) {
      const tribute = response.data.data;
      
      return {
        ...response,
        data: {
          id: tribute.tribute_id,
          user_id: tribute.created_by_user_id,
          loved_one_name: tribute.loved_ones_name,
          slug: tribute.slugified_name,
          created_at: new Date().toISOString(), // Default value as this isn't in the new API
          updated_at: new Date().toISOString(), // Default value as this isn't in the new API
          custom_html: tribute.page_html || '',
          phone_number: '', // Default value as this isn't in the new API
          number_of_streams: 0 // Default value as this isn't in the new API
        }
      };
    }
    
    return {
      ...response,
      data: undefined
    } as ApiResponse<Tribute>;
  }

  /**
   * Get a tribute by slug
   * 
   * @param slug Tribute slug
   * @returns Tribute data
   */
  async getTributeBySlug(slug: string): Promise<ApiResponse<Tribute>> {
    const response = await this.request<{ data: any }>(
      `${API_BASE_URL}/tribute-pages/by-slug/${encodeURIComponent(slug)}`
    );
    
    // Map the new API response format to the old format for backward compatibility
    if (response.success && response.data?.data) {
      const tribute = response.data.data;
      
      return {
        ...response,
        data: {
          id: tribute.tribute_id,
          user_id: tribute.created_by_user_id,
          loved_one_name: tribute.loved_ones_name,
          slug: tribute.slugified_name,
          created_at: new Date().toISOString(), // Default value as this isn't in the new API
          updated_at: new Date().toISOString(), // Default value as this isn't in the new API
          custom_html: tribute.page_html || '',
          phone_number: '', // Default value as this isn't in the new API
          number_of_streams: 0 // Default value as this isn't in the new API
        }
      };
    }
    
    return {
      ...response,
      data: undefined
    } as ApiResponse<Tribute>;
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
  } | {
    created_by_user_id: number;
    loved_ones_name: string;
    point_of_contact_user_id?: number;
    page_html?: string;
    loved_ones_dob?: string;
    loved_ones_dod?: string;
  }): Promise<ApiResponse<{ id: number; slug: string }>> {
    // Check if the data is in the old format
    if ('user_id' in data && 'loved_one_name' in data) {
      // Map the old format to the new format
      const newFormatData = {
        created_by_user_id: data.user_id,
        loved_ones_name: data.loved_one_name,
        page_html: data.custom_html,
        // Add any other fields that need to be mapped
      };
      
      const response = await this.request<{ data: { tribute_id: number; slugified_name: string } }>(
        `${API_BASE_URL}/tribute-pages`,
        {
          method: 'POST',
          body: JSON.stringify(newFormatData)
        }
      );
      
      if (response.success && response.data?.data) {
        return {
          ...response,
          data: {
            id: response.data.data.tribute_id,
            slug: response.data.data.slugified_name
          }
        };
      }
      
      return {
        ...response,
        data: undefined
      } as ApiResponse<{ id: number; slug: string }>;
    }
    
    // Use the new format directly
    const response = await this.request<{ data: { tribute_id: number; slugified_name: string } }>(
      `${API_BASE_URL}/tribute-pages`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    
    if (response.success && response.data?.data) {
      return {
        ...response,
        data: {
          id: response.data.data.tribute_id,
          slug: response.data.data.slugified_name
        }
      };
    }
    
    return {
      ...response,
      data: undefined
    } as ApiResponse<{ id: number; slug: string }>;
  }

  /**
   * Update an existing tribute
   * 
   * @param tributeId Tribute ID
   * @param data Updated tribute data
   * @returns Number of updated rows
   */
  async updateTribute(
    tributeId: number,
    data: {
      loved_one_name?: string;
      slug?: string;
      custom_html?: string;
      phone_number?: string;
      number_of_streams?: number;
      extended_data?: Record<string, any>;
    }
  ): Promise<ApiResponse<{ updated_rows: number }>> {
    // Map the old format to the new format
    const newFormatData: Record<string, any> = {};
    
    if (data.loved_one_name) {
      newFormatData.loved_ones_name = data.loved_one_name;
    }
    
    if (data.slug) {
      newFormatData.slugified_name = data.slug;
    }
    
    if (data.custom_html) {
      newFormatData.page_html = data.custom_html;
    }
    
    // Add any other fields that need to be mapped
    
    const response = await this.request<{ data: { tribute_id: number } }>(
      `${API_BASE_URL}/tribute-pages/${tributeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(newFormatData)
      }
    );
    
    if (response.success) {
      return {
        ...response,
        data: {
          updated_rows: 1 // Assume 1 row was updated
        }
      };
    }
    
    return {
      ...response,
      data: {
        updated_rows: 0
      }
    };
  }

  /**
   * Delete a tribute
   * 
   * @param tributeId Tribute ID
   * @returns Number of deleted rows
   */
  async deleteTribute(tributeId: number): Promise<ApiResponse<{ deleted_rows: number }>> {
    const response = await this.request<{ data: { deleted_id: number } }>(
      `${API_BASE_URL}/tribute-pages/${tributeId}`,
      {
        method: 'DELETE'
      }
    );
    
    if (response.success && response.data?.data) {
      return {
        ...response,
        data: {
          deleted_rows: 1 // Assume 1 row was deleted
        }
      };
    }
    
    return {
      ...response,
      data: {
        deleted_rows: 0
      }
    };
  }

  /**
   * Get extended data for a tribute
   * 
   * @param tributeId Tribute ID
   * @returns Extended data
   */
  async getTributeData(tributeId: number): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>(
      `${API_BASE_URL}/tribute-pages/${tributeId}/data`
    );
  }

  /**
   * Create extended data for a tribute
   * 
   * @param tributeId Tribute ID
   * @param data Extended data
   * @returns Success indicator
   */
  async createTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/tribute-pages/${tributeId}/data`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update extended data for a tribute
   * 
   * @param tributeId Tribute ID
   * @param data Extended data
   * @returns Success indicator
   */
  async updateTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/tribute-pages/${tributeId}/data`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Save form data
   * 
   * @param data Form data
   * @returns Success indicator
   */
  async saveFormData(data: FormData): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/forms`,
      {
        method: 'POST',
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
  async getFormData(userId: number): Promise<ApiResponse<FormData>> {
    return this.request<FormData>(
      `${API_BASE_URL}/forms/${userId}`
    );
  }
}

// Create a singleton instance for global use
export const tributeApi = new TributeApiClientImpl();

// Export default instance
export default tributeApi;