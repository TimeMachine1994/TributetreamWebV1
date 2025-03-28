/**
 * Events API Client
 * 
 * Provides methods for interacting with the events-related endpoints of the TributeStream API.
 * This version uses the new API client through the adapter for backward compatibility.
 */

import { tributeApiAdapter } from './tribute-api-adapter';
import { tributeApiV2 } from './tribute-api-client-v2';
import type { ApiResponse } from './tribute-api-client';
import type { Event } from '$lib/types/event';
import type { Location } from '$lib/types/location';
import type { User } from '$lib/types/user';
import type { Tribute } from '$lib/types/tribute';
import type { TributePage } from '$lib/server/types';
import {
  EVENTS_PATH,
  ACTIVE_EVENTS_PATH,
  LOCATIONS_PATH,
  TRIBUTE_PAGES_PATH,
  USERS_PATH,
  CURRENT_USER_PATH
} from './api-constants';

/**
 * Map TributePage to Tribute (for backward compatibility)
 * 
 * @param tributePage TributePage from the new API
 * @returns Tribute object compatible with the old format
 */
function mapTributePageToTribute(tributePage: TributePage): Tribute {
  return {
    id: tributePage.tribute_id,
    user_id: tributePage.created_by_user_id,
    loved_one_name: tributePage.loved_ones_name,
    slug: tributePage.slugified_name,
    created_at: new Date().toISOString(), // Default value as this isn't in the new API
    updated_at: new Date().toISOString(), // Default value as this isn't in the new API
    custom_html: tributePage.page_html || '',
    phone_number: '', // Default value as this isn't in the new API
    number_of_streams: 0 // Default value as this isn't in the new API
  };
}

/**
 * Events API
 */
class EventsApi {
  /**
   * Set custom fetch function for the underlying API client
   *
   * @param fetchFn Custom fetch function (e.g., event.fetch in SvelteKit server-side code)
   */
  setFetch(fetchFn: typeof fetch): void {
    tributeApiV2.setFetch(fetchFn);
  }
  /**
   * Get all tributes
   * 
   * @returns List of tributes
   */
  async getAllTributes(): Promise<ApiResponse<Tribute[]>> {
    try {
      const response = await tributeApiV2.getTributes();
      
      if (response.success && response.data) {
        const tributes = response.data.tributes.map(mapTributePageToTribute);
        
        return {
          success: true,
          data: tributes
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to fetch tributes',
        code: response.code,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get all events
   * 
   * @returns List of events
   */
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await tributeApiV2.request<{ events: Event[] }>(
        EVENTS_PATH
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.events
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get active events (not ended yet)
   * 
   * @returns List of active events
   */
  async getActiveEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await tributeApiV2.request<{ events: Event[] }>(
        ACTIVE_EVENTS_PATH
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.events
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get events for a location
   * 
   * @param locationId Location ID
   * @returns List of events
   */
  async getEventsByLocation(locationId: number): Promise<ApiResponse<Event[]>> {
    try {
      const response = await tributeApiV2.request<{ events: Event[] }>(
        `${LOCATIONS_PATH}/${locationId}/events`
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.events
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get events for a tribute
   * 
   * @param tributeId Tribute ID
   * @returns List of events
   */
  async getEventsByTribute(tributeId: number): Promise<ApiResponse<Event[]>> {
    try {
      const response = await tributeApiV2.request<{ events: Event[] }>(
        `${TRIBUTE_PAGES_PATH}/${tributeId}/events`
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.events
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get current user
   * 
   * @returns User data
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await tributeApiV2.request<User>(
        CURRENT_USER_PATH
      );
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get all locations
   * 
   * @returns List of locations
   */
  async getAllLocations(): Promise<ApiResponse<Location[]>> {
    try {
      const response = await tributeApiV2.request<{ locations: Location[] }>(
        LOCATIONS_PATH
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.locations
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Get locations for a tribute
   * 
   * @param tributeId Tribute ID
   * @returns List of locations
   */
  async getLocationsByTribute(tributeId: number): Promise<ApiResponse<Location[]>> {
    try {
      const response = await tributeApiV2.request<{ locations: Location[] }>(
        `${TRIBUTE_PAGES_PATH}/${tributeId}/locations`
      );
      
      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.locations
        };
      }
      
      return {
        ...response,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: {
    location_id: number;
    start_time: string;
    end_time: string;
    title?: string;
    description?: string;
    is_public?: boolean;
  }): Promise<ApiResponse<{ event_id: number }>> {
    try {
      const response = await tributeApiV2.request<{ event_id: number }>(
        EVENTS_PATH,
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      );
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Update an existing event
   * 
   * @param eventId Event ID
   * @param data Updated event data
   * @returns Updated event ID
   */
  async updateEvent(
    eventId: number,
    data: {
      location_id?: number;
      start_time?: string;
      end_time?: string;
      title?: string;
      description?: string;
      is_public?: boolean;
    }
  ): Promise<ApiResponse<{ event_id: number }>> {
    try {
      const response = await tributeApiV2.request<{ event_id: number }>(
        `${EVENTS_PATH}/${eventId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data)
        }
      );
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
  
  /**
   * Delete an event
   * 
   * @param eventId Event ID
   * @returns Deleted event ID
   */
  async deleteEvent(eventId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    try {
      const response = await tributeApiV2.request<{ deleted_id: number }>(
        `${EVENTS_PATH}/${eventId}`,
        {
          method: 'DELETE'
        }
      );
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 500
      };
    }
  }
}

// Create a singleton instance for global use
export const eventsApi = new EventsApi();

// Export default instance
export default eventsApi;