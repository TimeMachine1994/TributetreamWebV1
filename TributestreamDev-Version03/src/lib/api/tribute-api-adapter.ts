/**
 * TributeStream API Adapter
 * 
 * This adapter makes the new TributeApiClientV2 compatible with the existing
 * TributeApiClient interface expected by the persistence layers.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import type { 
  TributeApiClient, 
  ApiResponse, 
  Tribute, 
  TributeCollection, 
  TributeCreationResult,
  FormData
} from './tribute-api-client';
import type { 
  PaginatedTributePagesResponse,
  TributePage,
  CreateTributePageParams,
  UpdateTributePageParams
} from '$lib/server/types';

/**
 * Adapter class that implements the TributeApiClient interface
 * and delegates to the TributeApiClientV2 instance
 */
export class TributeApiAdapter implements TributeApiClient {
  /**
   * Set authentication token
   * 
   * @param token JWT token
   */
  setToken(token: string): void {
    tributeApiV2.setToken(token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    tributeApiV2.clearToken();
  }

  /**
   * Get all tributes with pagination
   * 
   * @param options Pagination options
   * @returns List of tributes
   */
  async getAllTributes(options: { page?: number; perPage?: number; search?: string } = {}): Promise<ApiResponse<TributeCollection>> {
    const response = await tributeApiV2.getTributes({
      page: options.page,
      perPage: options.perPage,
      search: options.search
    });

    // Map the new API response format to the old format for backward compatibility
    if (response.success && response.data) {
      const { tributes, total_items, total_pages, current_page } = response.data;
      
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
    const response = await tributeApiV2.getTributeById(tributeId);
    
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
    const response = await tributeApiV2.getTributeBySlug(slug);
    
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
  async createTribute(data: any): Promise<ApiResponse<TributeCreationResult>> {
    // Check if the data is in the old format
    if ('user_id' in data && 'loved_one_name' in data) {
      // Map the old format to the new format
      const newFormatData: CreateTributePageParams = {
        created_by_user_id: data.user_id,
        loved_ones_name: data.loved_one_name,
        page_html: data.custom_html,
        // Add any other fields that need to be mapped
      };
      
      const response = await tributeApiV2.createTribute(newFormatData);
      
      if (response.success && response.data) {
        return {
          ...response,
          data: {
            id: response.data.tribute_id,
            slug: response.data.slugified_name
          }
        };
      }
      
      return {
        ...response,
        data: undefined
      } as ApiResponse<TributeCreationResult>;
    }
    
    // Use the new format directly
    const response = await tributeApiV2.createTribute(data as CreateTributePageParams);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          id: response.data.tribute_id,
          slug: response.data.slugified_name
        }
      };
    }
    
    return {
      ...response,
      data: undefined
    } as ApiResponse<TributeCreationResult>;
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
    data: any
  ): Promise<ApiResponse<{ updated_rows: number }>> {
    // Map the old format to the new format
    const newFormatData: Partial<UpdateTributePageParams> = {};
    
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
    
    const response = await tributeApiV2.updateTribute(tributeId, newFormatData);
    
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
    const response = await tributeApiV2.deleteTribute(tributeId);
    
    if (response.success && response.data) {
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
    return tributeApiV2.getTributeData(tributeId);
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
    return tributeApiV2.createOrReplaceTributeData(tributeId, data);
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
    return tributeApiV2.updateTributeData(tributeId, data);
  }

  /**
   * Save form data
   *
   * @param data Form data
   * @returns Success indicator
   */
  async saveFormData(data: FormData): Promise<ApiResponse<{ success: boolean }>> {
    // Extract user ID from the form data or use a default
    const userId = typeof data['user_id'] === 'string'
      ? parseInt(data['user_id'], 10)
      : 0;
    
    // Convert FormData to Record<string, string>
    const formDataRecord: Record<string, string> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        formDataRecord[key] = data[key];
      }
    }
    
    return tributeApiV2.saveFormData(userId, formDataRecord);
  }

  /**
   * Get form data for a user
   *
   * @param userId User ID
   * @returns Form data
   */
  async getFormData(userId: number): Promise<ApiResponse<FormData>> {
    const response = await tributeApiV2.getFormData(userId);
    
    if (response.success && response.data) {
      // Convert the new API response format to the old format
      const formData: FormData = {
        'director-first-name': '',
        'director-last-name': '',
        'family-member-first-name': '',
        'family-member-last-name': '',
        'family-member-dob': '',
        'deceased-first-name': '',
        'deceased-last-name': '',
        'deceased-dob': '',
        'deceased-dop': '',
        'email-address': '',
        'phone-number': '',
        'location-name': '',
        'location-address': '',
        'memorial-time': '',
        'memorial-date': ''
      };
      
      // Copy values from the response
      if (response.data.form_data) {
        for (const key in response.data.form_data) {
          if (Object.prototype.hasOwnProperty.call(response.data.form_data, key)) {
            (formData as any)[key] = response.data.form_data[key];
          }
        }
      }
      
      return {
        ...response,
        data: formData
      };
    }
    
    return {
      ...response,
      data: undefined
    } as ApiResponse<FormData>;
  }
}

// Create a singleton instance for global use
export const tributeApiAdapter = new TributeApiAdapter();

// Export default instance
export default tributeApiAdapter;