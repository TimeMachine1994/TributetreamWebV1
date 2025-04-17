/**
 * Tribute Service
 * 
 * This service provides methods for interacting with tribute data.
 * It replaces the previous Backbone-based implementation with a modern approach
 * using fetch API and Svelte 5's reactivity system.
 */

import { browser } from '$app/environment';
import type { Tribute, TributeCollection, CreateTributePayload, TributeCreationResult } from '$lib/types/tribute';

// Create a singleton instance
let serviceInstance: TributeService | null = null;

/**
 * Tribute Service class
 */
export class TributeService {
  private initialized = false;

  /**
   * Initialize the service
   */
  initialize(): void {
    if (this.initialized) {
      console.log('Tribute service already initialized');
      return;
    }

    console.log('Initializing tribute service');
    this.initialized = true;
  }

  /**
   * Get all tributes
   * 
   * @param page The page number
   * @param perPage The number of items per page
   * @returns A promise that resolves to the tributes
   */
  async getTributes(page: number = 1, perPage: number = 10): Promise<Tribute[] | TributeCollection> {
    try {
      const response = await fetch(`/api/tributes?page=${page}&per_page=${perPage}`, {
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tributes: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle both array and collection formats
      if (Array.isArray(data)) {
        return data as Tribute[];
      } else if (data.tributes) {
        return data as TributeCollection;
      } else {
        return {
          tributes: [],
          total_pages: 0,
          total_items: 0,
          current_page: page
        };
      }
    } catch (error) {
      console.error('Error fetching tributes:', error);
      throw error;
    }
  }

  /**
   * Get a tribute by ID
   * 
   * @param id The ID of the tribute to fetch
   * @returns A promise that resolves to the tribute
   */
  async getTributeById(id: number | string): Promise<Tribute> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const response = await fetch(`/api/tributes/${numericId}`, {
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tribute || data;
    } catch (error) {
      console.error(`Error fetching tribute ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a tribute by slug
   * 
   * @param slug The slug of the tribute to fetch
   * @returns A promise that resolves to the tribute
   */
  async getTributeBySlug(slug: string): Promise<Tribute> {
    try {
      const response = await fetch(`/api/tributes/by-slug/${slug}`, {
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tribute by slug: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tribute || data;
    } catch (error) {
      console.error(`Error fetching tribute by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tribute
   * 
   * @param tributeData The tribute data to create
   * @returns A promise that resolves to the created tribute
   */
  async createTribute(tributeData: CreateTributePayload): Promise<TributeCreationResult> {
    try {
      const response = await fetch('/api/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tributeData),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to create tribute: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating tribute:', error);
      throw error;
    }
  }

  /**
   * Update an existing tribute
   * 
   * @param id The ID of the tribute to update
   * @param tributeData The tribute data to update
   * @returns A promise that resolves to the updated tribute
   */
  async updateTribute(id: number | string, tributeData: Partial<Tribute>): Promise<Tribute> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const response = await fetch(`/api/tributes/${numericId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tributeData),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tribute || data;
    } catch (error) {
      console.error(`Error updating tribute ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tribute
   * 
   * @param id The ID of the tribute to delete
   * @returns A promise that resolves to true if the tribute was deleted
   */
  async deleteTribute(id: number | string): Promise<boolean> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const response = await fetch(`/api/tributes/${numericId}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to delete tribute: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting tribute ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search for tributes
   * 
   * @param query The search query
   * @param page The page number
   * @param perPage The number of items per page
   * @returns A promise that resolves to the search results
   */
  async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<TributeCollection> {
    try {
      const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        tributes: data.tributes || [],
        total_pages: data.total_pages || 1,
        total_items: data.total_items || data.tributes?.length || 0,
        current_page: page
      };
    } catch (error) {
      console.error('Error searching tributes:', error);
      throw error;
    }
  }
}

/**
 * Get the tribute service instance
 * 
 * @returns The tribute service instance
 */
export function getTributeService(): TributeService {
  if (!serviceInstance) {
    serviceInstance = new TributeService();
  }
  return serviceInstance;
}

/**
 * Initialize the tribute service
 * 
 * This function is a replacement for the previous initializeBackbone function.
 * It should be called once when the app starts, typically in a layout component.
 */
export function initializeTributeService(): void {
  if (browser) {
    const service = getTributeService();
    service.initialize();
  }
}

// Create and export the service instance
export const tributeService = getTributeService();
