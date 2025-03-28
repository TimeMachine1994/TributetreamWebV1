/**
 * Extended TributeStream API Client
 * 
 * Extends the base TributeApiClientImpl with additional methods for events and user roles.
 */

import { TributeApiClientImpl, type ApiResponse, type TributeCollection } from './tribute-api-client';
import type { Event } from '$lib/types/event';
import type { Location } from '$lib/types/location';
import type { User } from '$lib/types/user';
import type { Tribute } from '$lib/types/tribute';
import {
  API_BASE_URL,
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
function mapTributePageToTribute(tributePage: any): Tribute {
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
 * Extended API Client Class
 */
export class ExtendedTributeApiClient extends TributeApiClientImpl {
  /**
   * Get all tributes (admin only)
   * 
   * @param options Pagination options
   * @returns All tributes
   */
  async getAllTributes(options: { page?: number; perPage?: number; search?: string } = {}): Promise<ApiResponse<TributeCollection>> {
    const { page = 1, perPage = 10, search = '' } = options;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const response = await this.request<{ data: { tributes: any[]; total_items: number; total_pages: number; current_page: number } }>(
      `${TRIBUTE_PAGES_PATH}?${queryParams.toString()}`
    );
    
    // Map the new API response format to the old format for backward compatibility
    if (response.success && response.data?.data) {
      const { tributes, total_items, total_pages, current_page } = response.data.data;
      
      const mappedTributes = tributes.map(mapTributePageToTribute);
      
      return {
        ...response,
        data: {
          tributes: mappedTributes,
          total_pages,
          total_items,
          current_page
        }
      };
    }
    
    return {
      ...response,
      data: {
        tributes: [],
        total_pages: 0,
        total_items: 0,
        current_page: 1
      }
    } as ApiResponse<TributeCollection>;
  }

  /**
   * Get all events
   * 
   * @returns List of all events
   */
  async getAllEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${EVENTS_PATH}`
    );
  }

  /**
   * Get active events (not ended yet)
   * 
   * @returns List of active events
   */
  async getActiveEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${ACTIVE_EVENTS_PATH}`
    );
  }

  /**
   * Get events for a specific location
   * 
   * @param locationId Location ID
   * @returns Events for the location
   */
  async getEventsByLocation(locationId: string | number): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${LOCATIONS_PATH}/${locationId}/events`
    );
  }

  /**
   * Get events for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @returns Events for the tribute
   */
  async getEventsByTribute(tributeId: string | number): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/events`
    );
  }

  /**
   * Get current user information with role
   * 
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>(
      `${CURRENT_USER_PATH}`
    );
  }

  /**
   * Get all locations
   * 
   * @returns List of all locations
   */
  async getAllLocations(): Promise<ApiResponse<{ locations: Location[] }>> {
    return this.request<{ locations: Location[] }>(
      `${LOCATIONS_PATH}`
    );
  }

  /**
   * Get locations for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @returns Locations for the tribute
   */
  async getLocationsByTribute(tributeId: string | number): Promise<ApiResponse<{ locations: Location[] }>> {
    return this.request<{ locations: Location[] }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/locations`
    );
  }

  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: {
    location_id: string | number;
    stream_html?: string;
    start_time: string;
    end_time: string;
  }): Promise<ApiResponse<{ event_id: number }>> {
    return this.request<{ event_id: number }>(
      `${EVENTS_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update an existing event
   * 
   * @param eventId Event ID
   * @param data Updated event data
   * @returns Update result
   */
  async updateEvent(
    eventId: string | number,
    data: Partial<{
      location_id: string | number;
      stream_html: string;
      start_time: string;
      end_time: string;
    }>
  ): Promise<ApiResponse<{ event_id: number }>> {
    return this.request<{ event_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Delete an event
   * 
   * @param eventId Event ID
   * @returns Delete result
   */
  async deleteEvent(eventId: string | number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'DELETE'
      }
    );
  }
}

/**
 * Create a singleton instance for global use
 */
export const extendedTributeApi = new ExtendedTributeApiClient();

/**
 * Export default instance
 */
export default extendedTributeApi;