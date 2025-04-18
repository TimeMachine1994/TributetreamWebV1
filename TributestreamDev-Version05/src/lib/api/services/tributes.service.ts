import type { Tribute, TributeCreateInput, TributeUpdateInput, WPPaginatedResponse, WPSuccessResponse } from '$lib/types/wordpress.types';

/**
 * Tributes service for WordPress REST API
 * 
 * This service handles CRUD operations for WordPress tributes.
 */
export class TributesService {
  /**
   * Get all tributes with pagination
   * @param page Page number (1-based)
   * @param perPage Number of items per page
   * @returns Promise resolving to paginated tributes
   */
  async getTributes(
    page: number = 1,
    perPage: number = 10
  ): Promise<WPPaginatedResponse<Tribute>> {
    console.log(`[TributesService] Getting tributes page ${page}, perPage ${perPage}`);
    
    // Make the request to the SvelteKit server endpoint
    const url = new URL('/api/tributes', window.location.origin);
    
    // Add query parameters
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());
    
    console.log(`[TributesService] Request URL: ${url.toString()}`);
    
    try {
      // Make the request
      console.log('[TributesService] Sending fetch request...');
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      console.log(`[TributesService] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TributesService] Error response: ${errorText}`);
        throw new Error(`Failed to fetch tributes: ${response.statusText}`);
      }
      
      // Parse the response
      console.log('[TributesService] Parsing response JSON...');
      const responseData = await response.json();
      console.log('[TributesService] Response data:', responseData);
      
      if (!responseData.success) {
        console.error('[TributesService] API reported failure:', responseData.message);
        throw new Error(responseData.message || 'Failed to fetch tributes');
      }
      
      // Return the paginated response
      const result = {
        data: responseData.data,
        total_items: responseData.pagination.total_items,
        total_pages: responseData.pagination.total_pages,
        current_page: responseData.pagination.current_page
      };
      
      console.log('[TributesService] Successfully fetched tributes:', result);
      return result;
    } catch (error) {
      console.error('[TributesService] Error in getTributes:', error);
      throw error;
    }
  }
  
  /**
   * Get a single tribute by ID
   * @param id Tribute ID
   * @returns Promise resolving to the tribute
   */
  async getTribute(id: number): Promise<Tribute> {
    const response = await fetch(`/api/tributes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch tribute');
    }
    
    return responseData.data;
  }
  
  /**
   * Create a new tribute
   * @param data Tribute data
   * @returns Promise resolving to the created tribute
   */
  async createTribute(data: TributeCreateInput): Promise<Tribute> {
    const response = await fetch('/api/tributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create tribute: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to create tribute');
    }
    
    return responseData.data;
  }
  
  /**
   * Update an existing tribute
   * @param id Tribute ID
   * @param data Tribute data to update
   * @returns Promise resolving to the updated tribute
   */
  async updateTribute(
    id: number,
    data: TributeUpdateInput
  ): Promise<Tribute> {
    const response = await fetch(`/api/tributes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update tribute: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to update tribute');
    }
    
    return responseData.data;
  }
  
  /**
   * Delete a tribute
   * @param id Tribute ID
   * @returns Promise resolving to success response
   */
  async deleteTribute(id: number): Promise<WPSuccessResponse<Tribute>> {
    const response = await fetch(`/api/tributes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete tribute: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to delete tribute');
    }
    
    return responseData;
  }
}

// Create and export a singleton instance
export const tributesService = new TributesService();