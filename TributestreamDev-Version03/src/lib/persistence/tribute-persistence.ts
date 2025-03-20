/**
 * TributeStream Persistence Layer
 * 
 * This module provides a robust and efficient persistence layer for Tributestream data,
 * sitting between the UI components and the WordPress API. It handles caching, data
 * transformation, and error recovery strategies.
 */

import { browser } from '$app/environment';
import { TributeApiClient, type FormData, type ApiResponse, type Tribute } from '$lib/api/tribute-api-client';
import { writable, type Writable } from 'svelte/store';

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
 * TributePersistence - Enhanced persistence layer for Tributestream data
 */
export class TributePersistence {
  private apiClient: TributeApiClient;
  private formDataCache: Map<number, CacheEntry<FormData>> = new Map();
  private tributeCache: Map<number, CacheEntry<Tribute>> = new Map();
  private userTributesCache: Map<number, CacheEntry<Tribute[]>> = new Map();
  
  // Stores for reactive data
  private formDataStores: Map<number, Writable<FormData | null>> = new Map();
  private tributeStores: Map<number, Writable<Tribute | null>> = new Map();
  private userTributeStores: Map<number, Writable<Tribute[] | null>> = new Map();
  
  // Error handling configuration
  private maxRetries = 3;
  private retryDelayMs = 1000;
  
  /**
   * Constructor
   * 
   * @param apiClient Optional API client instance
   */
  constructor(apiClient?: TributeApiClient) {
    this.apiClient = apiClient || new TributeApiClient();
  }
  
  /**
   * Set API client (useful for testing or changing authentication)
   * 
   * @param apiClient API client instance
   */
  setApiClient(apiClient: TributeApiClient): void {
    this.apiClient = apiClient;
  }
  
  /**
   * Get form data for a user with caching
   * 
   * @param userId User ID
   * @param options Options for cache handling
   * @returns Form data and success indicator
   */
  async getFormData(
    userId: number, 
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: FormData | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.formDataCache.get(userId);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateFormDataStore(userId, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.getFormData(userId),
        options.retry ?? true
      );
      
      if (response.success && response.data?.form_data) {
        // Update cache
        this.formDataCache.set(userId, {
          data: response.data.form_data,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateFormDataStore(userId, response.data.form_data);
        
        return { data: response.data.form_data, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch form data'
      };
    } catch (error) {
      console.error('Error fetching form data:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for form data that stays in sync
   * 
   * @param userId User ID
   * @returns Svelte store with form data
   */
  getFormDataStore(userId: number): Writable<FormData | null> {
    if (!this.formDataStores.has(userId)) {
      // Initialize a new store
      const store = writable<FormData | null>(null);
      this.formDataStores.set(userId, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getFormData(userId).catch(err => 
          console.error('Error initializing form data store:', err)
        );
      }
    }
    
    return this.formDataStores.get(userId)!;
  }
  
  /**
   * Save form data for a user
   * 
   * @param userId User ID
   * @param formData Form data to save
   * @param tributeId Optional tribute ID to update
   * @returns Success indicator and error message if any
   */
  async saveFormData(
    userId: number,
    formData: FormData,
    tributeId?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate form data before saving
      const validationResult = this.validateFormData(formData);
      if (!validationResult.valid) {
        return { 
          success: false, 
          error: `Form validation failed: ${validationResult.errors.join(', ')}`
        };
      }
      
      // Save to API
      const response = await this.executeWithRetry(() => 
        this.apiClient.saveFormData(userId, formData, tributeId)
      );
      
      if (response.success) {
        // Update cache
        this.formDataCache.set(userId, {
          data: formData,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateFormDataStore(userId, formData);
        
        // Invalidate tribute caches if a tribute was updated
        if (tributeId) {
          this.tributeCache.delete(tributeId);
          this.userTributesCache.delete(userId);
          this.updateTributeStore(tributeId, null);
          this.updateUserTributeStore(userId, null);
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to save form data'
      };
    } catch (error) {
      console.error('Error saving form data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a tribute by ID with caching
   * 
   * @param tributeId Tribute ID
   * @param options Options for cache handling
   * @returns Tribute data and success indicator
   */
  async getTributeById(
    tributeId: number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Tribute | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.tributeCache.get(tributeId);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateTributeStore(tributeId, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.getTributeById(tributeId),
        options.retry ?? true
      );
      
      if (response.success && response.data) {
        // Update cache
        this.tributeCache.set(tributeId, {
          data: response.data,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateTributeStore(tributeId, response.data);
        
        return { data: response.data, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch tribute'
      };
    } catch (error) {
      console.error('Error fetching tribute:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for a tribute that stays in sync
   * 
   * @param tributeId Tribute ID
   * @returns Svelte store with tribute data
   */
  getTributeStore(tributeId: number): Writable<Tribute | null> {
    if (!this.tributeStores.has(tributeId)) {
      // Initialize a new store
      const store = writable<Tribute | null>(null);
      this.tributeStores.set(tributeId, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getTributeById(tributeId).catch(err => 
          console.error('Error initializing tribute store:', err)
        );
      }
    }
    
    return this.tributeStores.get(tributeId)!;
  }
  
  /**
   * Get tributes for a user with caching
   * 
   * @param userId User ID
   * @param options Options for cache handling
   * @returns User's tributes and success indicator
   */
  async getTributesByUser(
    userId: number,
    options: { 
      forceRefresh?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<{ data: Tribute[] | null; success: boolean; error?: string }> {
    // Check cache first unless force refresh requested
    if (!options.forceRefresh) {
      const cachedEntry = this.userTributesCache.get(userId);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
        this.updateUserTributeStore(userId, cachedEntry.data);
        return { data: cachedEntry.data, success: true };
      }
    }
    
    // Fetch from API
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.getTributesByUser(userId),
        options.retry ?? true
      );
      
      if (response.success && response.data?.tributes) {
        // Update cache
        this.userTributesCache.set(userId, {
          data: response.data.tributes,
          timestamp: Date.now()
        });
        
        // Update store
        this.updateUserTributeStore(userId, response.data.tributes);
        
        // Also cache individual tributes
        for (const tribute of response.data.tributes) {
          this.tributeCache.set(tribute.id, {
            data: tribute,
            timestamp: Date.now()
          });
          this.updateTributeStore(tribute.id, tribute);
        }
        
        return { data: response.data.tributes, success: true };
      }
      
      return { 
        data: null, 
        success: false, 
        error: response.error || 'Failed to fetch user tributes'
      };
    } catch (error) {
      console.error('Error fetching user tributes:', error);
      return { 
        data: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get a Svelte store for user tributes that stays in sync
   * 
   * @param userId User ID
   * @returns Svelte store with user's tributes
   */
  getUserTributesStore(userId: number): Writable<Tribute[] | null> {
    if (!this.userTributeStores.has(userId)) {
      // Initialize a new store
      const store = writable<Tribute[] | null>(null);
      this.userTributeStores.set(userId, store);
      
      // If browser environment, fetch data to populate the store
      if (browser) {
        this.getTributesByUser(userId).catch(err => 
          console.error('Error initializing user tributes store:', err)
        );
      }
    }
    
    return this.userTributeStores.get(userId)!;
  }
  
  /**
   * Create a new tribute
   * 
   * @param data Tribute data
   * @returns Created tribute ID and success indicator
   */
  async createTribute(data: {
    user_id: number;
    loved_one_name: string;
    phone_number: string;
    slug?: string;
    custom_html?: string;
    number_of_streams?: number;
    extended_data?: Record<string, any>;
  }): Promise<{ tributeId?: number; slug?: string; success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.createTribute(data)
      );
      
      if (response.success && response.data) {
        // Invalidate user tributes cache
        this.userTributesCache.delete(data.user_id);
        this.updateUserTributeStore(data.user_id, null);
        
        return { 
          tributeId: response.data.id,
          slug: response.data.slug,
          success: true 
        };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to create tribute'
      };
    } catch (error) {
      console.error('Error creating tribute:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Update an existing tribute
   * 
   * @param tributeId Tribute ID
   * @param data Updated tribute data
   * @returns Success indicator
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
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.updateTribute(tributeId, data)
      );
      
      if (response.success) {
        // Invalidate cache for this tribute
        this.tributeCache.delete(tributeId);
        this.updateTributeStore(tributeId, null);
        
        // Get the existing tribute to find the user_id
        const existingTributeResponse = await this.getTributeById(tributeId, { forceRefresh: true });
        
        if (existingTributeResponse.success && existingTributeResponse.data) {
          // Invalidate user tributes cache
          const userId = existingTributeResponse.data.user_id;
          this.userTributesCache.delete(userId);
          this.updateUserTributeStore(userId, null);
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Failed to update tribute'
      };
    } catch (error) {
      console.error('Error updating tribute:', error);
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
    this.formDataCache.clear();
    this.tributeCache.clear();
    this.userTributesCache.clear();
    
    // Reset stores
    for (const [userId, store] of this.formDataStores.entries()) {
      store.set(null);
    }
    
    for (const [tributeId, store] of this.tributeStores.entries()) {
      store.set(null);
    }
    
    for (const [userId, store] of this.userTributeStores.entries()) {
      store.set(null);
    }
  }
  
  /**
   * Update form data store
   * 
   * @param userId User ID
   * @param data Form data
   */
  private updateFormDataStore(userId: number, data: FormData | null): void {
    const store = this.formDataStores.get(userId);
    if (store) {
      store.set(data);
    }
  }
  
  /**
   * Update tribute store
   * 
   * @param tributeId Tribute ID
   * @param data Tribute data
   */
  private updateTributeStore(tributeId: number, data: Tribute | null): void {
    const store = this.tributeStores.get(tributeId);
    if (store) {
      store.set(data);
    }
  }
  
  /**
   * Update user tribute store
   * 
   * @param userId User ID
   * @param data User's tributes
   */
  private updateUserTributeStore(userId: number, data: Tribute[] | null): void {
    const store = this.userTributeStores.get(userId);
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
  
  /**
   * Validate form data
   * 
   * @param formData Form data to validate
   * @returns Validation result
   */
  private validateFormData(formData: FormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    const requiredFields: Record<string, string> = {
      'director-first-name': "Director's first name is required",
      'director-last-name': "Director's last name is required",
      'deceased-first-name': "Deceased's first name is required",
      'deceased-last-name': "Deceased's last name is required",
      'email-address': "Email address is required",
      'location-name': "Memorial location name is required"
    };
    
    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        errors.push(message);
      }
    }
    
    // Email validation
    if (formData['email-address'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['email-address'])) {
      errors.push("Invalid email format");
    }
    
    // Phone number validation
    if (formData['phone-number'] && !/^[0-9\-\+\(\)\s]{7,20}$/.test(formData['phone-number'])) {
      errors.push("Invalid phone number format");
    }
    
    // Date validations
    const dateFields = ['deceased-dob', 'deceased-dop', 'memorial-date', 'family-member-dob'];
    for (const field of dateFields) {
      if (formData[field] && isNaN(new Date(formData[field]).getTime())) {
        errors.push(`Invalid date format for ${field}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Create a singleton instance for global use
 */
export const tributePersistence = new TributePersistence();

/**
 * Export default instance
 */
export default tributePersistence;