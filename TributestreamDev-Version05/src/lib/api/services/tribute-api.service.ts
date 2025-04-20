import type { 
  Tribute, 
  TributeCreateInput, 
  TributeExtendedData, 
  TributePaginatedResponse, 
  TributeUpdateInput, 
  SuccessResponse 
} from '$lib/types/tribute.types';

/**
 * Tribute API service for interacting with the WordPress tributes API
 */
export class TributeApiService {
  /**
   * Get all tributes with pagination
   * @param page Page number (1-based)
   * @param perPage Number of items per page
   * @param search Optional search term
   * @returns Promise resolving to paginated tributes
   */
  async getTributes(
    page: number = 1,
    perPage: number = 10,
    search?: string
  ): Promise<TributePaginatedResponse> {
    const url = new URL('/api/wp/tributes', window.location.origin);
    
    // Add query parameters
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());
    
    if (search) {
      url.searchParams.set('search', search);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for authentication
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tributes: ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get a single tribute by ID
   * @param id Tribute ID
   * @returns Promise resolving to the tribute
   */
  async getTributeById(id: number): Promise<Tribute> {
    const response = await fetch(`/api/wp/tributes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  /**
   * Get a single tribute by slug
   * @param slug Tribute slug
   * @returns Promise resolving to the tribute
   */
  async getTributeBySlug(slug: string): Promise<Tribute> {
    const response = await fetch(`/api/wp/tribute/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute by slug: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  /**
   * Get tributes by user ID
   * @param userId User ID
   * @returns Promise resolving to tributes
   */
  async getTributesByUser(userId: number): Promise<Tribute[]> {
    const response = await fetch(`/api/wp/tributes/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tributes by user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.tributes;
  }
  
  /**
   * Create a new tribute
   * @param data Tribute data
   * @returns Promise resolving to success response
   */
  async createTribute(data: TributeCreateInput): Promise<SuccessResponse> {
    const response = await fetch('/api/wp/tributes', {
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
    
    return await response.json();
  }
  
  /**
   * Update an existing tribute
   * @param id Tribute ID
   * @param data Tribute data to update
   * @returns Promise resolving to success response
   */
  async updateTribute(
    id: number,
    data: TributeUpdateInput
  ): Promise<SuccessResponse> {
    const response = await fetch(`/api/wp/tributes/${id}`, {
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
    
    return await response.json();
  }
  
  /**
   * Delete a tribute
   * @param id Tribute ID
   * @returns Promise resolving to success response
   */
  async deleteTribute(id: number): Promise<SuccessResponse> {
    const response = await fetch(`/api/wp/tributes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete tribute: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get extended tribute data
   * @param tributeId Tribute ID
   * @returns Promise resolving to extended tribute data
   */
  async getTributeData(tributeId: number): Promise<TributeExtendedData> {
    const response = await fetch(`/api/wp/tribute-data/${tributeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute data: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Create or replace extended tribute data
   * @param tributeId Tribute ID
   * @param data Extended tribute data
   * @returns Promise resolving to success response
   */
  async createOrReplaceTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<SuccessResponse> {
    const response = await fetch(`/api/wp/tribute-data/${tributeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create tribute data: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Update extended tribute data (partial update)
   * @param tributeId Tribute ID
   * @param data Extended tribute data to update
   * @returns Promise resolving to success response
   */
  async updateTributeData(
    tributeId: number,
    data: Record<string, any>
  ): Promise<SuccessResponse> {
    const response = await fetch(`/api/wp/tribute-data/${tributeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update tribute data: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Create and export a singleton instance
export const tributeApiService = new TributeApiService();