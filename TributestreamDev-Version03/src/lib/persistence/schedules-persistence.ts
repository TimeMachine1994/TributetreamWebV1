/**
 * Schedules Persistence Layer
 * 
 * This module provides a robust and efficient persistence layer for schedules data,
 * sitting between the UI components and the WordPress API. It handles caching, data
 * transformation, and error recovery strategies.
 */

import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { schedulesApi } from '$lib/api/schedules-api';
import type { ApiResponse } from '$lib/api/tribute-api-client';
import type { 
  Schedule, 
  CreateScheduleParams, 
  UpdateScheduleParams,
  PaginatedSchedulesResponse
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
 * SchedulesPersistence - Enhanced persistence layer for schedules data
 */
export class SchedulesPersistence {
  private schedulesCache: Map<string, CacheEntry<Schedule[]>> = new Map();
  private scheduleCache: Map<number, CacheEntry<Schedule>> = new Map();
  
  // Stores for reactive data
  private schedulesStores: Map<string, Writable<Schedule[] | null>> = new Map();
  private scheduleStores: Map<number, Writable<Schedule | null>> = new Map();
  
  // Error handling configuration
  private maxRetries = 3;
  private retryDelayMs = 1000;
  
  /**
   * Get all schedules with caching and pagination
   * 
   * @param options Options for pagination and cache handling
   * @returns Schedules and success indicator
   */
  async getSchedules(
    options: { 
      page?: number;
      perPage?: number;
      tributeId?: number;
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: PaginatedSchedulesResponse | null; success: boolean; error?: string }> {
    const { page = 1, perPage = 10, tributeId } = options;
    const cacheKey = tributeId 
      ? `schedules_tribute_${tributeId}_page_${page}_perPage_${perPage}`
      : `schedules_page_${page}_perPage_${perPage}`;
    
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.schedulesCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateSchedulesStore(cacheKey, cachedEntry.data);
        return { 
          data: {
            schedules: cachedEntry.data,
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
        schedulesApi.getSchedules({ page, perPage, tributeId }),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Update cache
        this.schedulesCache.set(cacheKey, {
          data: response.data.schedules,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateSchedulesStore(cacheKey, response.data.schedules);
        
        return { data: response.data, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch schedules'
      };
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for schedules that stays in sync
   * 
   * @param options Options for filtering schedules
   * @returns Svelte store with schedules
   */
  getSchedulesStore(options: { tributeId?: number } = {}): Writable<Schedule[] | null> {
    const { tributeId } = options;
    const cacheKey = tributeId 
      ? `schedules_tribute_${tributeId}`
      : 'schedules_all';
    
    if (!this.schedulesStores.has(cacheKey)) {
      // Initialize a new store
      const store = writable<Schedule[] | null>(null);
      this.schedulesStores.set(cacheKey, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getSchedules({ tributeId }).catch(err => 
          console.error('Error initializing schedules store:', err)
        );
      }
    }
    
    return this.schedulesStores.get(cacheKey)!;
  }
  
  /**
   * Get a schedule by ID with caching
   * 
   * @param id Schedule ID
   * @param options Options for cache handling
   * @returns Schedule and success indicator
   */
  async getScheduleById(
    id: number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Schedule | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.scheduleCache.get(id);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateScheduleStore(id, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        schedulesApi.getScheduleById(id),
        options.retry ?? true
      );
      
      if (response.success && response.data && response.data.data) {
        const schedule = response.data.data;
        
        // Update cache
        this.scheduleCache.set(id, {
          data: schedule,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateScheduleStore(id, schedule);
        
        return { data: schedule, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch schedule'
      };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for a schedule that stays in sync
   * 
   * @param id Schedule ID
   * @returns Svelte store with schedule
   */
  getScheduleStore(id: number): Writable<Schedule | null> {
    if (!this.scheduleStores.has(id)) {
      // Initialize a new store
      const store = writable<Schedule | null>(null);
      this.scheduleStores.set(id, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getScheduleById(id).catch(err => 
          console.error('Error initializing schedule store:', err)
        );
      }
    }
    
    return this.scheduleStores.get(id)!;
  }
  
  /**
   * Create a new schedule
   * 
   * @param data Schedule data
   * @returns Created schedule ID and success indicator
   */
  async createSchedule(
    data: CreateScheduleParams
  ): Promise<{ scheduleId?: number; tributeId?: number; success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        schedulesApi.createSchedule(data)
      );
      
      if (response.success && response.data) {
        // Invalidate cache
        this.clearCaches();
        
        // Invalidate tribute-specific cache
        const tributeId = data.tribute_id;
        const tributeCacheKey = `schedules_tribute_${tributeId}`;
        this.schedulesCache.delete(tributeCacheKey);
        
        const store = this.schedulesStores.get(tributeCacheKey);
        if (store) {
          store.set(null);
        }
        
        return { 
          scheduleId: response.data.schedule_id,
          tributeId: response.data.tribute_id,
          success: true 
        };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to create schedule'
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Update an existing schedule
   * 
   * @param id Schedule ID
   * @param data Updated schedule data
   * @returns Success indicator
   */
  async updateSchedule(
    id: number,
    data: UpdateScheduleParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        schedulesApi.updateSchedule(id, data)
      );
      
      if (response.success) {
        // Invalidate cache for this schedule
        this.scheduleCache.delete(id);
        this.updateScheduleStore(id, null);
        
        // Invalidate all schedules cache
        this.schedulesCache.clear();
        
        // Reset all schedule stores
        for (const [cacheKey, store] of this.schedulesStores.entries()) {
          store.set(null);
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to update schedule'
      };
    } catch (error) {
      console.error('Error updating schedule:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Delete a schedule
   * 
   * @param id Schedule ID
   * @returns Success indicator
   */
  async deleteSchedule(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        schedulesApi.deleteSchedule(id)
      );
      
      if (response.success) {
        // Invalidate cache for this schedule
        this.scheduleCache.delete(id);
        this.updateScheduleStore(id, null);
        
        // Invalidate all schedules cache
        this.schedulesCache.clear();
        
        // Reset all schedule stores
        for (const [cacheKey, store] of this.schedulesStores.entries()) {
          store.set(null);
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to delete schedule'
      };
    } catch (error) {
      console.error('Error deleting schedule:', error);
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
    this.schedulesCache.clear();
    this.scheduleCache.clear();
    
    // Reset stores
    for (const [cacheKey, store] of this.schedulesStores.entries()) {
      store.set(null);
    }
    
    for (const [id, store] of this.scheduleStores.entries()) {
      store.set(null);
    }
  }
  
  /**
   * Update schedules store
   * 
   * @param cacheKey Cache key
   * @param data Schedules data
   */
  private updateSchedulesStore(cacheKey: string, data: Schedule[] | null): void {
    const store = this.schedulesStores.get(cacheKey);
    if (store) {
      store.set(data);
    }
  }
  
  /**
   * Update schedule store
   * 
   * @param id Schedule ID
   * @param data Schedule data
   */
  private updateScheduleStore(id: number, data: Schedule | null): void {
    const store = this.scheduleStores.get(id);
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
export const schedulesPersistence = new SchedulesPersistence();

/**
 * Export default instance
 */
export default schedulesPersistence;
