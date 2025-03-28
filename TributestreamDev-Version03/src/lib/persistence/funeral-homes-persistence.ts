/**
 * Funeral Homes Persistence Layer
 * 
 * This module provides a robust and efficient persistence layer for funeral homes data,
 * sitting between the UI components and the WordPress API. It handles caching, data
 * transformation, and error recovery strategies.
 */

import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { funeralHomesApi } from '$lib/api/funeral-homes-api';
import type { ApiResponse } from '$lib/api/tribute-api-client';
import type { 
  FuneralHome, 
  CreateFuneralHomeParams, 
  UpdateFuneralHomeParams,
  PaginatedFuneralHomesResponse
} from '$lib/server/types';

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Interface for cache entries
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * FuneralHomesPersistence - Enhanced persistence layer for funeral homes data
 */
export class FuneralHomesPersistence {
  private funeralHomesCache: Map<string, CacheEntry<FuneralHome[]>> = new Map();
  private funeralHomeCache: Map<number, CacheEntry<FuneralHome>> = new Map();
  
  // Stores for reactive data
  private funeralHomesStore: Writable<FuneralHome[] | null> = writable(null);
  private funeralHomeStores: Map<number, Writable<FuneralHome | null>> = new Map();
  
  // Error handling configuration
  private maxRetries = 3;
  private retryDelayMs = 1000;
  
  /**
   * Get all funeral homes with caching and pagination
   * 
   * @param options Options for pagination and cache handling
   * @returns Funeral homes and success indicator
   */
  async getFuneralHomes(
    options: { 
      page?: number;
      perPage?: number;
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: PaginatedFuneralHomesResponse | null; success: boolean; error?: string }> {
    const { page = 1, perPage = 10 } = options;
    const cacheKey = `funeral_homes_page_${page}_perPage_${perPage}`;
    
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.funeralHomesCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        return { 
          data: {
            funeral_homes: cachedEntry.data,
            total_items: cachedEntry.data.length, // This is an approximation
            total_pages: 1, // This is an approximation
            current_page: page
          }, 
          success: true 
        };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        funeralHomesApi.getFuneralHomes({ page, perPage }),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Update cache
        this.funeralHomesCache.set(cacheKey, {
          data: response.data.funeral_homes,
          timestamp: Date.now()
        });
        
        // Update store
        this.funeralHomesStore.set(response.data.funeral_homes);
        
        return { data: response.data, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch funeral homes'
      };
    } catch (error) {
      console.error('Error fetching funeral homes:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for funeral homes that stays in sync
   * 
   * @returns Svelte store with funeral homes
   */
  getFuneralHomesStore(): Writable<FuneralHome[] | null> {
    // If browser environment and store is empty, fetch data to populate it
    if (browser) {
      this.getFuneralHomes().catch(err => 
        console.error('Error initializing funeral homes store:', err)
      );
    }
    
    return this.funeralHomesStore;
  }
  
  /**
   * Get a funeral home by ID with caching
   * 
   * @param id Funeral home ID
   * @param options Options for cache handling
   * @returns Funeral home and success indicator
   */
  async getFuneralHomeById(
    id: number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: FuneralHome | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.funeralHomeCache.get(id);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateFuneralHomeStore(id, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        funeralHomesApi.getFuneralHomeById(id),
        options.retry ?? true
      );
      
      if (response.success && response.data && response.data.data) {
        const funeralHome = response.data.data;
        
        // Update cache
        this.funeralHomeCache.set(id, {
          data: funeralHome,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateFuneralHomeStore(id, funeralHome);
        
        return { data: funeralHome, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch funeral home'
      };
    } catch (error) {
      console.error('Error fetching funeral home:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for a funeral home that stays in sync
   * 
   * @param id Funeral home ID
   * @returns Svelte store with funeral home
   */
  getFuneralHomeStore(id: number): Writable<FuneralHome | null> {
    if (!this.funeralHomeStores.has(id)) {
      // Initialize a new store
      const store = writable<FuneralHome | null>(null);
      this.funeralHomeStores.set(id, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getFuneralHomeById(id).catch(err => 
          console.error('Error initializing funeral home store:', err)
        );
      }
    }
    
    return this.funeralHomeStores.get(id)!;
  }
  
  /**
   * Create a new funeral home
   * 
   * @param data Funeral home data
   * @returns Created funeral home ID and success indicator
   */
  async createFuneralHome(
    data: CreateFuneralHomeParams
  ): Promise<{ funeralHomeId?: number; success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        funeralHomesApi.createFuneralHome(data)
      );
      
      if (response.success && response.data) {
        // Invalidate cache
        this.clearCaches();
        
        return { 
          funeralHomeId: response.data.funeral_home_id,
          success: true 
        };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to create funeral home'
      };
    } catch (error) {
      console.error('Error creating funeral home:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Update an existing funeral home
   * 
   * @param id Funeral home ID
   * @param data Updated funeral home data
   * @returns Success indicator
   */
  async updateFuneralHome(
    id: number,
    data: UpdateFuneralHomeParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        funeralHomesApi.updateFuneralHome(id, data)
      );
      
      if (response.success) {
        // Invalidate cache for this funeral home
        this.funeralHomeCache.delete(id);
        this.updateFuneralHomeStore(id, null);
        
        // Invalidate all funeral homes cache
        this.funeralHomesCache.clear();
        this.funeralHomesStore.set(null);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to update funeral home'
      };
    } catch (error) {
      console.error('Error updating funeral home:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Delete a funeral home
   * 
   * @param id Funeral home ID
   * @returns Success indicator
   */
  async deleteFuneralHome(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        funeralHomesApi.deleteFuneralHome(id)
      );
      
      if (response.success) {
        // Invalidate cache for this funeral home
        this.funeralHomeCache.delete(id);
        this.updateFuneralHomeStore(id, null);
        
        // Invalidate all funeral homes cache
        this.funeralHomesCache.clear();
        this.funeralHomesStore.set(null);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to delete funeral home'
      };
    } catch (error) {
      console.error('Error deleting funeral home:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.funeralHomesCache.clear();
    this.funeralHomeCache.clear();
    
    // Reset stores
    this.funeralHomesStore.set(null);
    
    for (const [id, store] of this.funeralHomeStores.entries()) {
      store.set(null);
    }
  }
  
  /**
   * Update funeral home store
   * 
   * @param id Funeral home ID
   * @param data Funeral home data
   */
  private updateFuneralHomeStore(id: number, data: FuneralHome | null): void {
    const store = this.funeralHomeStores.get(id);
    if (store) {
      store.set(data);
    }
  }
  
  /**
   * Execute API call with retry logic
   * 
   * @param apiCall API call function
   * @param retry Whether to retry on failure
   * @param attempt Current attempt number
   * @returns API response
   */
  private async executeWithRetry<T>(
    apiCall: () => Promise<ApiResponse<T>>, 
    retry = true,
    attempt = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiCall();
      
      // If API call failed and we haven't exceeded max retries
      if (!response.success && retry && attempt < this.maxRetries) {
        // Wait before retrying (with exponential backoff)
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the call
        return this.executeWithRetry(apiCall, retry, attempt + 1);
      }
      
      return response;
    } catch (error) {
      // If network error and we haven't exceeded max retries
      if (retry && attempt < this.maxRetries) {
        // Wait before retrying (with exponential backoff)
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the call
        return this.executeWithRetry(apiCall, retry, attempt + 1);
      }
      
      // Max retries exceeded or retry disabled, return error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      };
    }
  }
}

/**
 * Create a singleton instance for global use
 */
export const funeralHomesPersistence = new FuneralHomesPersistence();

/**
 * Export default instance
 */
export default funeralHomesPersistence;