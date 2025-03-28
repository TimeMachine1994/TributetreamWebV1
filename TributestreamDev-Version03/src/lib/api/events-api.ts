/**
 * Events API Client
 * 
 * Provides methods for interacting with the events-related endpoints of the TributeStream API.
 */

import { tributeApi } from './tribute-api-client';
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
 * Events API Client
 */
export const eventsApi = {
  /**
   * Get all tributes (admin only)
   * 
   * @returns All tributes
   */
  async getAllTributes(): Promise<ApiResponse<{ tributes: Tribute[] }>> {
    const response = await tributeApi['request']<{ tributes: TributePage[] }>(
      `${TRIBUTE_PAGES_PATH}`
    );

    // If the request was successful, map TributePage[] to Tribute[]
    if (response.success && response.data?.tributes) {
      return {
        ...response,
        data: {
          tributes: response.data.tributes.map(mapTributePageToTribute)
        }
      };
    }

    // If the request failed, return the error response
    return {
      ...response,
      data: { tributes: [] }
    } as ApiResponse<{ tributes: Tribute[] }>;
  },

  /**
   * Get all events
   * 
   * @returns List of all events
   */
  async getAllEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    return tributeApi['request']<{ events: Event[] }>(
      `${EVENTS_PATH}`
    );
  },

  /**
   * Get active events (not ended yet)
   * 
   * @returns List of active events
   */
  async getActiveEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    return tributeApi['request']<{ events: Event[] }>(
      `${ACTIVE_EVENTS_PATH}`
    );
  },

  /**
   * Get events for a specific location
   * 
   * @param locationId Location ID
   * @returns Events for the location
   */
  async getEventsByLocation(locationId: number | string): Promise<ApiResponse<{ events: Event[] }>> {
    return tributeApi['request']<{ events: Event[] }>(
      `${LOCATIONS_PATH}/${locationId}/events`
    );
  },

  /**
   * Get events for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @returns Events for the tribute
   */
  async getEventsByTribute(tributeId: number | string): Promise<ApiResponse<{ events: Event[] }>> {
    return tributeApi['request']<{ events: Event[] }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/events`
    );
  },

  /**
   * Get current user information with role
   * 
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return tributeApi['request']<User>(
      `${CURRENT_USER_PATH}`
    );
  },

  /**
   * Get all locations
   * 
   * @returns List of all locations
   */
  async getAllLocations(): Promise<ApiResponse<{ locations: Location[] }>> {
    return tributeApi['request']<{ locations: Location[] }>(
      `${LOCATIONS_PATH}`
    );
  },

  /**
   * Get locations for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @returns Locations for the tribute
   */
  async getLocationsByTribute(tributeId: number | string): Promise<ApiResponse<{ locations: Location[] }>> {
    return tributeApi['request']<{ locations: Location[] }>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/locations`
    );
  },

  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: {
    location_id: number | string;
    stream_html?: string;
    start_time: string;
    end_time: string;
  }): Promise<ApiResponse<{ event_id: number }>> {
    return tributeApi['request']<{ event_id: number }>(
      `${EVENTS_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Update an existing event
   * 
   * @param eventId Event ID
   * @param data Updated event data
   * @returns Update result
   */
  async updateEvent(
    eventId: number | string,
    data: Partial<{
      location_id: number | string;
      stream_html: string;
      start_time: string;
      end_time: string;
    }>
  ): Promise<ApiResponse<{ event_id: number }>> {
    return tributeApi['request']<{ event_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Delete an event
   * 
   * @param eventId Event ID
   * @returns Delete result
   */
  async deleteEvent(eventId: number | string): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApi['request']<{ deleted_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default eventsApi;