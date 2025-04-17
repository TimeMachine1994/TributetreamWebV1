/**
 * Tribute Store - State Machine for Tribute models
 * 
 * This module provides a state machine for managing Tribute models.
 * It uses Svelte 5 runes for reactivity and replaces the previous Backbone implementation.
 */

import { setContext, getContext } from 'svelte';
import type { Tribute, TributeCollection, CreateTributePayload, TributeCreationResult } from '$lib/types/tribute';
import { validateTribute } from '$lib/utils/validation';
import { tributeService } from '$lib/services/tribute-service';

/**
 * Define the possible states for the tribute store
 */
export const TributeStoreStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  SAVING: 'saving',
  DELETING: 'deleting',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

export type TributeStoreState = typeof TributeStoreStates[keyof typeof TributeStoreStates];

/**
 * Define the interface for tribute search results
 */
export interface TributeSearchResults {
  tributes: Tribute[];
  total_pages: number;
  currentPage: number;
}

/**
 * Unique symbol key for the context
 */
const tributeStoreKey = Symbol('tributeStore');

/**
 * Tribute Store - State Machine for Tribute models
 * 
 * This class provides a state machine for managing Tribute models.
 * It uses Svelte 5 runes for reactivity.
 */
export class TributeStore {
  // State machine state
  state = $state<TributeStoreState>(TributeStoreStates.IDLE);
  
  // Current tribute being viewed or edited
  currentTribute = $state<Partial<Tribute>>({
    loved_one_name: '',
    phone_number: '',
    custom_html: ''
  });
  
  // Search results
  searchResults = $state<TributeSearchResults>({
    tributes: [],
    total_pages: 1,
    currentPage: 1
  });
  
  // Error message
  error = $state<string | null>(null);
  
  // Validation errors
  validationErrors = $state<Record<string, string> | null>(null);
  
  // Derived state for loading status
  isLoading = $derived(this.state === TributeStoreStates.LOADING);
  
  // Derived state for saving status
  isSaving = $derived(this.state === TributeStoreStates.SAVING);
  
  // Derived state for deleting status
  isDeleting = $derived(this.state === TributeStoreStates.DELETING);
  
  // Derived state for error status
  hasError = $derived(this.state === TributeStoreStates.ERROR);
  
  // Derived state for success status
  isSuccess = $derived(this.state === TributeStoreStates.SUCCESS);
  
  /**
   * Constructor
   */
  constructor() {
    // Set up effects for state transitions
    $effect(() => {
      if (this.state === TributeStoreStates.SUCCESS || this.state === TributeStoreStates.ERROR) {
        // Reset state after 3 seconds
        const timeout = setTimeout(() => {
          this.state = TributeStoreStates.IDLE;
        }, 3000);
        
        // Clean up the timeout when the effect is re-run
        return () => clearTimeout(timeout);
      }
    });
  }
  
  /**
   * Fetch a tribute by ID
   * 
   * @param id The ID of the tribute to fetch
   * @returns A promise that resolves to the fetched tribute
   */
  async fetchTribute(id: number | string): Promise<Tribute | null> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const tribute = await tributeService.getTributeById(id);
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tribute';
      return null;
    }
  }
  
  /**
   * Fetch a tribute by slug
   * 
   * @param slug The slug of the tribute to fetch
   * @returns A promise that resolves to the fetched tribute
   */
  async fetchTributeBySlug(slug: string): Promise<Tribute | null> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const tribute = await tributeService.getTributeBySlug(slug);
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tribute';
      return null;
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
  async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<TributeSearchResults> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const result = await tributeService.searchTributes(query, page, perPage);
      
      const results: TributeSearchResults = {
        tributes: result.tributes || [],
        total_pages: result.total_pages || 1,
        currentPage: page
      };
      
      this.searchResults = results;
      this.state = TributeStoreStates.SUCCESS;
      
      return results;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to search tributes';
      
      return {
        tributes: [],
        total_pages: 1,
        currentPage: 1
      };
    }
  }
  
  /**
   * Get all tributes
   * 
   * @param page The page number
   * @param perPage The number of items per page
   * @returns A promise that resolves to the paginated tributes
   */
  async getTributes(page: number = 1, perPage: number = 10): Promise<TributeSearchResults> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const result = await tributeService.getTributes(page, perPage);
      
      let tributes: Tribute[] = [];
      let totalPages = 1;
      
      // Handle both array and collection formats
      if (Array.isArray(result)) {
        tributes = result;
        totalPages = 1;
      } else {
        tributes = result.tributes || [];
        totalPages = result.total_pages || 1;
      }
      
      const results: TributeSearchResults = {
        tributes,
        total_pages: totalPages,
        currentPage: page
      };
      
      this.searchResults = results;
      this.state = TributeStoreStates.SUCCESS;
      
      return results;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tributes';
      
      return {
        tributes: [],
        total_pages: 1,
        currentPage: 1
      };
    }
  }
  
  /**
   * Create a new tribute
   * 
   * @param tributeData The tribute data to create
   * @returns A promise that resolves to the created tribute
   */
  async createTribute(tributeData: CreateTributePayload): Promise<TributeCreationResult | null> {
    try {
      // Validate the tribute data
      const { isValid, errors } = validateTribute(tributeData);
      if (!isValid) {
        this.validationErrors = errors;
        this.state = TributeStoreStates.ERROR;
        this.error = 'Validation failed';
        return null;
      }
      
      this.state = TributeStoreStates.SAVING;
      this.error = null;
      this.validationErrors = null;
      
      const result = await tributeService.createTribute(tributeData);
      
      // If we have the full tribute data, update currentTribute
      if ('loved_one_name' in result) {
        this.currentTribute = result as unknown as Tribute;
      }
      
      this.state = TributeStoreStates.SUCCESS;
      
      return result;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to create tribute';
      return null;
    }
  }
  
  /**
   * Update an existing tribute
   * 
   * @param id The ID of the tribute to update
   * @param tributeData The tribute data to update
   * @returns A promise that resolves to the updated tribute
   */
  async updateTribute(id: number | string, tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      // Validate the tribute data
      const { isValid, errors } = validateTribute({ ...this.currentTribute, ...tributeData });
      if (!isValid) {
        this.validationErrors = errors;
        this.state = TributeStoreStates.ERROR;
        this.error = 'Validation failed';
        return null;
      }
      
      this.state = TributeStoreStates.SAVING;
      this.error = null;
      this.validationErrors = null;
      
      const tribute = await tributeService.updateTribute(id, tributeData);
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to update tribute';
      return null;
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
      this.state = TributeStoreStates.DELETING;
      this.error = null;
      
      const success = await tributeService.deleteTribute(id);
      
      // Clear current tribute if it's the one being deleted
      if (this.currentTribute.id === id) {
        this.currentTribute = {
          loved_one_name: '',
          phone_number: '',
          custom_html: ''
        };
      }
      
      this.state = TributeStoreStates.SUCCESS;
      
      return success;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to delete tribute';
      return false;
    }
  }
  
  /**
   * Reset the store
   */
  reset(): void {
    this.state = TributeStoreStates.IDLE;
    this.currentTribute = {
      loved_one_name: '',
      phone_number: '',
      custom_html: ''
    };
    this.error = null;
    this.validationErrors = null;
  }
}

/**
 * Set the tribute store in the context
 * 
 * @returns The tribute store instance
 */
export function setTributeStoreContext(): TributeStore {
  const store = new TributeStore();
  setContext(tributeStoreKey, store);
  return store;
}

/**
 * Get the tribute store from the context
 * 
 * @returns The tribute store instance
 */
export function getTributeStoreContext(): TributeStore {
  return getContext<TributeStore>(tributeStoreKey);
}
