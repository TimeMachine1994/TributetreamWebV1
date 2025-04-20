import { tributeApiService } from '$lib/api/services/tribute-api.service';
import type { 
  Tribute, 
  TributeCreateInput, 
  TributeExtendedData, 
  TributePaginatedResponse, 
  TributeUpdateInput 
} from '$lib/types/tribute.types';

/**
 * Tribute store using Svelte 5 runes
 */
class TributeStore {
  // State
  tributes = $state<Tribute[]>([]);
  currentTribute = $state<Tribute | null>(null);
  tributeExtendedData = $state<TributeExtendedData | null>(null);
  isLoading = $state(false);
  error = $state<string | null>(null);
  
  // Pagination
  totalItems = $state(0);
  totalPages = $state(0);
  currentPage = $state(1);
  
  // Derived state
  tributesById = $derived(() => {
    const map = new Map<number, Tribute>();
    this.tributes.forEach(tribute => {
      map.set(tribute.id, tribute);
    });
    return map;
  });
  
  /**
   * Load tributes with pagination
   * @param page Page number
   * @param perPage Items per page
   * @param search Optional search term
   */
  async loadTributes(page: number = 1, perPage: number = 10, search?: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await tributeApiService.getTributes(page, perPage, search);
      
      this.tributes = response.tributes;
      this.totalItems = response.total_items;
      this.totalPages = response.total_pages;
      this.currentPage = response.current_page;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load tributes';
      console.error('Error loading tributes:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Load a single tribute by ID
   * @param id Tribute ID
   */
  async loadTributeById(id: number) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const tribute = await tributeApiService.getTributeById(id);
      this.currentTribute = tribute;
      
      return tribute;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load tribute';
      console.error('Error loading tribute:', error);
      this.currentTribute = null;
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Load a single tribute by slug
   * @param slug Tribute slug
   */
  async loadTributeBySlug(slug: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const tribute = await tributeApiService.getTributeBySlug(slug);
      this.currentTribute = tribute;
      
      return tribute;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load tribute';
      console.error('Error loading tribute by slug:', error);
      this.currentTribute = null;
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Load tributes by user ID
   * @param userId User ID
   */
  async loadTributesByUser(userId: number) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const tributes = await tributeApiService.getTributesByUser(userId);
      this.tributes = tributes;
      
      return tributes;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load tributes by user';
      console.error('Error loading tributes by user:', error);
      this.tributes = [];
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Create a new tribute
   * @param data Tribute data
   */
  async createTribute(data: TributeCreateInput) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const result = await tributeApiService.createTribute(data);
      
      // Reload tributes to include the new one
      await this.loadTributes(this.currentPage);
      
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to create tribute';
      console.error('Error creating tribute:', error);
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Update an existing tribute
   * @param id Tribute ID
   * @param data Tribute data to update
   */
  async updateTribute(id: number, data: TributeUpdateInput) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const result = await tributeApiService.updateTribute(id, data);
      
      // Update the tribute in the store if it exists
      if (this.currentTribute && this.currentTribute.id === id) {
        this.currentTribute = { ...this.currentTribute, ...data };
      }
      
      // Update in the tributes array if it exists
      this.tributes = this.tributes.map(tribute => 
        tribute.id === id ? { ...tribute, ...data } : tribute
      );
      
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to update tribute';
      console.error('Error updating tribute:', error);
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Delete a tribute
   * @param id Tribute ID
   */
  async deleteTribute(id: number) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const result = await tributeApiService.deleteTribute(id);
      
      // Remove the tribute from the store
      this.tributes = this.tributes.filter(tribute => tribute.id !== id);
      
      // Clear current tribute if it's the one being deleted
      if (this.currentTribute && this.currentTribute.id === id) {
        this.currentTribute = null;
      }
      
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to delete tribute';
      console.error('Error deleting tribute:', error);
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Load extended tribute data
   * @param tributeId Tribute ID
   */
  async loadTributeData(tributeId: number) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const data = await tributeApiService.getTributeData(tributeId);
      this.tributeExtendedData = data;
      
      return data;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load tribute data';
      console.error('Error loading tribute data:', error);
      this.tributeExtendedData = null;
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Create or replace extended tribute data
   * @param tributeId Tribute ID
   * @param data Extended tribute data
   */
  async createOrReplaceTributeData(tributeId: number, data: Record<string, any>) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const result = await tributeApiService.createOrReplaceTributeData(tributeId, data);
      
      // Update the extended data in the store
      this.tributeExtendedData = { tribute_reference: tributeId, ...data };
      
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to create tribute data';
      console.error('Error creating tribute data:', error);
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Update extended tribute data (partial update)
   * @param tributeId Tribute ID
   * @param data Extended tribute data to update
   */
  async updateTributeData(tributeId: number, data: Record<string, any>) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const result = await tributeApiService.updateTributeData(tributeId, data);
      
      // Update the extended data in the store if it exists
      if (this.tributeExtendedData && this.tributeExtendedData.tribute_reference === tributeId) {
        this.tributeExtendedData = { ...this.tributeExtendedData, ...data };
      }
      
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to update tribute data';
      console.error('Error updating tribute data:', error);
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Reset store state
   */
  reset() {
    this.tributes = [];
    this.currentTribute = null;
    this.tributeExtendedData = null;
    this.isLoading = false;
    this.error = null;
    this.totalItems = 0;
    this.totalPages = 0;
    this.currentPage = 1;
  }
}

// Create and export a singleton instance
export const tributeStore = new TributeStore();