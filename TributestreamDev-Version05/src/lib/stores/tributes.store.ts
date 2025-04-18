import { writable, derived } from 'svelte/store';
import type { Tribute } from '$lib/types/wordpress.types';
import { tributesService } from '$lib/api/services/tributes.service';

/**
 * Tributes store state interface
 */
interface TributesState {
  tributes: Tribute[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Initial state for the tributes store
 */
const initialState: TributesState = {
  tributes: [],
  isLoading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1
};

/**
 * Create a tributes store
 */
function createTributesStore() {
  const { subscribe, set, update } = writable<TributesState>(initialState);
  
  return {
    subscribe,
    
    /**
     * Load tributes with pagination
     * @param page Page number (1-based)
     * @param perPage Number of items per page
     */
    async loadTributes(page: number = 1, perPage: number = 10) {
      console.log('[TributesStore] loadTributes called with page:', page, 'perPage:', perPage);
      
      // Set loading state
      console.log('[TributesStore] Setting loading state to true');
      update(state => {
        console.log('[TributesStore] Previous state:', state);
        return { ...state, isLoading: true, error: null };
      });
      
      try {
        console.log('[TributesStore] Calling tributesService.getTributes');
        const result = await tributesService.getTributes(page, perPage);
        console.log('[TributesStore] Got result from service:', result);
        
        // Update state with the result
        console.log('[TributesStore] Setting new state with data');
        const newState = {
          tributes: result.data,
          isLoading: false, // Explicitly set to false
          error: null,
          totalItems: result.total_items,
          totalPages: result.total_pages,
          currentPage: result.current_page
        };
        
        console.log('[TributesStore] New state:', newState);
        
        // Use update instead of set to ensure reactivity
        update(() => newState);
        
        // Force an update to ensure the loading state is changed
        setTimeout(() => {
          update(state => {
            console.log('[TributesStore] Forcing update, current state:', state);
            return { ...state, isLoading: false };
          });
        }, 100);
        
        // Verify the state was updated correctly
        setTimeout(() => {
          const unsubscribe = subscribe(state => {
            console.log('[TributesStore] Current state after update:', state);
            unsubscribe();
          });
        }, 200);
        
        console.log('[TributesStore] State updated successfully');
      } catch (error) {
        console.error('[TributesStore] Error in loadTributes:', error);
        
        // Update state with the error
        console.log('[TributesStore] Setting error state');
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load tributes'
        }));
      }
    },
    
    /**
     * Load a single tribute by ID
     * @param id Tribute ID
     */
    async loadTribute(id: number) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const tribute = await tributesService.getTribute(id);
        
        update(state => {
          // Find the tribute in the current list
          const index = state.tributes.findIndex(t => t.tribute_id === id);
          
          // If the tribute exists, update it; otherwise, add it to the list
          const tributes = [...state.tributes];
          if (index !== -1) {
            tributes[index] = tribute;
          } else {
            tributes.push(tribute);
          }
          
          return {
            ...state,
            tributes,
            isLoading: false,
            error: null
          };
        });
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load tribute'
        }));
      }
    },
    
    /**
     * Create a new tribute
     * @param data Tribute data
     */
    async createTribute(data: any) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const tribute = await tributesService.createTribute(data);
        
        update(state => ({
          ...state,
          tributes: [...state.tributes, tribute],
          isLoading: false,
          error: null
        }));
        
        return tribute;
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create tribute'
        }));
        
        throw error;
      }
    },
    
    /**
     * Update an existing tribute
     * @param id Tribute ID
     * @param data Tribute data
     */
    async updateTribute(id: number, data: any) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const tribute = await tributesService.updateTribute(id, data);
        
        update(state => {
          // Find the tribute in the current list
          const index = state.tributes.findIndex(t => t.tribute_id === id);
          
          // If the tribute exists, update it; otherwise, add it to the list
          const tributes = [...state.tributes];
          if (index !== -1) {
            tributes[index] = tribute;
          } else {
            tributes.push(tribute);
          }
          
          return {
            ...state,
            tributes,
            isLoading: false,
            error: null
          };
        });
        
        return tribute;
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update tribute'
        }));
        
        throw error;
      }
    },
    
    /**
     * Delete a tribute
     * @param id Tribute ID
     */
    async deleteTribute(id: number) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await tributesService.deleteTribute(id);
        
        update(state => ({
          ...state,
          tributes: state.tributes.filter(t => t.tribute_id !== id),
          isLoading: false,
          error: null
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete tribute'
        }));
        
        throw error;
      }
    },
    
    /**
     * Reset the store to its initial state
     */
    reset() {
      set(initialState);
    }
  };
}

// Create and export the store
export const tributesStore = createTributesStore();

// Derived stores for convenience
export const tributes = derived(tributesStore, $store => $store.tributes);
export const isLoading = derived(tributesStore, $store => $store.isLoading);
export const error = derived(tributesStore, $store => $store.error);
export const totalItems = derived(tributesStore, $store => $store.totalItems);
export const totalPages = derived(tributesStore, $store => $store.totalPages);
export const currentPage = derived(tributesStore, $store => $store.currentPage);