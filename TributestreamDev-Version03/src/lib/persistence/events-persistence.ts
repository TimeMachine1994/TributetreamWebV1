/**
 * Events Persistence Layer
 * 
 * This module provides a robust and efficient persistence layer for events data,
 * sitting between the UI components and the WordPress API. It handles caching, data
 * transformation, and error recovery strategies.
 */

import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { eventsApi } from '$lib/api/events-api';
import type { ApiResponse } from '$lib/api/tribute-api-client';
import type { Event } from '$lib/types/event';
import type { Location } from '$lib/types/location';
import type { Tribute } from '$lib/types/tribute';
import { sortEventsByStatusAndTime } from '$lib/types/event';

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
 * EventsPersistence - Enhanced persistence layer for events data
 */
export class EventsPersistence {
  private eventsCache: Map<string, CacheEntry<Event[]>> = new Map();
  private locationCache: Map<string, CacheEntry<Location[]>> = new Map();
  private allTributesCache: CacheEntry<Tribute[]> | null = null;
  
  // Stores for reactive data
  private eventsStores: Map<string, Writable<Event[] | null>> = new Map();
  private locationStores: Map<string, Writable<Location[] | null>> = new Map();
  private allTributesStore: Writable<Tribute[] | null> = writable(null);
  
  // Error handling configuration
  private maxRetries = 3;
  private retryDelayMs = 1000;
  
  /**
   * Get active events with caching
   * 
   * @param options Options for cache handling
   * @returns Active events and success indicator
   */
  async getActiveEvents(
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Event[] | null; success: boolean; error?: string }> {
    const cacheKey = 'active_events';
    
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.eventsCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateEventsStore(cacheKey, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        eventsApi.getActiveEvents(),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Sort events by status and start time
        const sortedEvents = sortEventsByStatusAndTime(response.data);
        
        // Update cache
        this.eventsCache.set(cacheKey, {
          data: sortedEvents,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateEventsStore(cacheKey, sortedEvents);
        
        return { data: sortedEvents, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch active events'
      };
    } catch (error) {
      console.error('Error fetching active events:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for active events that stays in sync
   * 
   * @returns Svelte store with active events
   */
  getActiveEventsStore(): Writable<Event[] | null> {
    const cacheKey = 'active_events';
    
    if (!this.eventsStores.has(cacheKey)) {
      // Initialize a new store
      const store = writable<Event[] | null>(null);
      this.eventsStores.set(cacheKey, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getActiveEvents().catch(err => 
          console.error('Error initializing active events store:', err)
        );
      }
    }
    
    return this.eventsStores.get(cacheKey)!;
  }
  
  /**
   * Get events for a specific location with caching
   * 
   * @param locationId Location ID
   * @param options Options for cache handling
   * @returns Events for the location and success indicator
   */
  async getEventsByLocation(
    locationId: string | number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Event[] | null; success: boolean; error?: string }> {
    const cacheKey = `location_${locationId}_events`;
    
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.eventsCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateEventsStore(cacheKey, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        eventsApi.getEventsByLocation(typeof locationId === 'string' ? parseInt(locationId, 10) : locationId),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Sort events by status and start time
        const sortedEvents = sortEventsByStatusAndTime(response.data);
        
        // Update cache
        this.eventsCache.set(cacheKey, {
          data: sortedEvents,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateEventsStore(cacheKey, sortedEvents);
        
        return { data: sortedEvents, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch location events'
      };
    } catch (error) {
      console.error('Error fetching location events:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for location events that stays in sync
   * 
   * @param locationId Location ID
   * @returns Svelte store with location events
   */
  getLocationEventsStore(locationId: string | number): Writable<Event[] | null> {
    const cacheKey = `location_${locationId}_events`;
    
    if (!this.eventsStores.has(cacheKey)) {
      // Initialize a new store
      const store = writable<Event[] | null>(null);
      this.eventsStores.set(cacheKey, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getEventsByLocation(locationId).catch(err => 
          console.error('Error initializing location events store:', err)
        );
      }
    }
    
    return this.eventsStores.get(cacheKey)!;
  }
  
  /**
   * Get events for a specific tribute with caching
   * 
   * @param tributeId Tribute ID
   * @param options Options for cache handling
   * @returns Events for the tribute and success indicator
   */
  async getEventsByTribute(
    tributeId: string | number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Event[] | null; success: boolean; error?: string }> {
    const cacheKey = `tribute_${tributeId}_events`;
    
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.eventsCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateEventsStore(cacheKey, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        eventsApi.getEventsByTribute(typeof tributeId === 'string' ? parseInt(tributeId, 10) : tributeId),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Sort events by status and start time
        const sortedEvents = sortEventsByStatusAndTime(response.data);
        
        // Update cache
        this.eventsCache.set(cacheKey, {
          data: sortedEvents,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateEventsStore(cacheKey, sortedEvents);
        
        return { data: sortedEvents, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch tribute events'
      };
    } catch (error) {
      console.error('Error fetching tribute events:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for tribute events that stays in sync
   * 
   * @param tributeId Tribute ID
   * @returns Svelte store with tribute events
   */
  getTributeEventsStore(tributeId: string | number): Writable<Event[] | null> {
    const cacheKey = `tribute_${tributeId}_events`;
    
    if (!this.eventsStores.has(cacheKey)) {
      // Initialize a new store
      const store = writable<Event[] | null>(null);
      this.eventsStores.set(cacheKey, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getEventsByTribute(tributeId).catch(err => 
          console.error('Error initializing tribute events store:', err)
        );
      }
    }
    
    return this.eventsStores.get(cacheKey)!;
  }
  
  /**
   * Get all tributes (admin only) with caching
   * 
   * @param options Options for cache handling
   * @returns All tributes and success indicator
   */
  async getAllTributes(
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Tribute[] | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh && this.allTributesCache && (Date.now() - this.allTributesCache.timestamp) < CACHE_TTL) {
      this.allTributesStore.set(this.allTributesCache.data);
      return { data: this.allTributesCache.data, success: true };
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        eventsApi.getAllTributes(),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Update cache
        this.allTributesCache = {
          data: response.data,
          timestamp: Date.now()
        };
        
        // Update store
        this.allTributesStore.set(response.data);
        
        return { data: response.data, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch all tributes'
      };
    } catch (error) {
      console.error('Error fetching all tributes:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for all tributes that stays in sync
   * 
   * @returns Svelte store with all tributes
   */
  getAllTributesStore(): Writable<Tribute[] | null> {
    // If browser environment and store is empty, fetch data to populate it
    if (browser && !this.allTributesCache) {
      this.getAllTributes().catch(err => 
        console.error('Error initializing all tributes store:', err)
      );
    }
    
    return this.allTributesStore;
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.eventsCache.clear();
    this.locationCache.clear();
    this.allTributesCache = null;
    
    // Reset stores
    for (const [cacheKey, store] of this.eventsStores.entries()) {
      store.set(null);
    }
    
    for (const [locationId, store] of this.locationStores.entries()) {
      store.set(null);
    }
    
    this.allTributesStore.set(null);
  }
  
  /**
   * Update events store
   * 
   * @param cacheKey Cache key
   * @param data Events data
   */
  private updateEventsStore(cacheKey: string, data: Event[] | null): void {
    const store = this.eventsStores.get(cacheKey);
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
export const eventsPersistence = new EventsPersistence();

/**
 * Export default instance
 */
export default eventsPersistence;