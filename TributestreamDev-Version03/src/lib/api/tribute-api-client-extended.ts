/**
 * Extended TributeStream API Client
 * 
 * Extends the base TributeApiClient with additional methods for events and user roles.
 */

import { TributeApiClient, API_BASE_URL, ApiResponse } from './tribute-api-client';
import type { Event } from '$lib/types/event';
import type { Location } from '$lib/types/location';
import type { User } from '$lib/types/user';
import type { Tribute } from '$lib/types/tribute';

/**
 * Extended API Client Class
 */
export class ExtendedTributeApiClient extends TributeApiClient {
  /**
   * Get all tributes (admin only)
   * 
   * @returns All tributes
   */
  async getAllTributes(): Promise<ApiResponse<{ tributes: Tribute[] }>> {
    return this.request<{ tributes: Tribute[] }>(
      `${API_BASE_URL}/tributes/all`
    );
  }

  /**
   * Get all events
   * 
   * @returns List of all events
   */
  async getAllEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${API_BASE_URL}/events`
    );
  }

  /**
   * Get active events (not ended yet)
   * 
   * @returns List of active events
   */
  async getActiveEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    const now = new Date().toISOString();
    return this.request<{ events: Event[] }>(
      `${API_BASE_URL}/events?end_time_gt=${now}`
    );
  }

  /**
   * Get events for a specific location
   * 
   * @param locationId Location ID
   * @returns Events for the location
   */
  async getEventsByLocation(locationId: string): Promise<ApiResponse<{ events: Event[] }>> {
    return this.request<{ events: Event[] }>(
      `${API_BASE_URL}/locations/${locationId}/events`
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
      `${API_BASE_URL}/tributes/${tributeId}/events`
    );
  }

  /**
   * Get current user information with role
   * 
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>(
      `${API_BASE_URL}/users/me`
    );
  }

  /**
   * Get all locations
   * 
   * @returns List of all locations
   */
  async getAllLocations(): Promise<ApiResponse<{ locations: Location[] }>> {
    return this.request<{ locations: Location[] }>(
      `${API_BASE_URL}/locations`
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
      `${API_BASE_URL}/tributes/${tributeId}/locations`
    );
  }

  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: {
    location_id: string;
    stream_html?: string;
    start_time: string;
    end_time: string;
  }): Promise<ApiResponse<{ event_id: string }>> {
    return this.request<{ event_id: string }>(
      `${API_BASE_URL}/events`,
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
    eventId: string,
    data: Partial<{
      location_id: string;
      stream_html: string;
      start_time: string;
      end_time: string;
    }>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/events/${eventId}`,
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
  async deleteEvent(eventId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
      `${API_BASE_URL}/events/${eventId}`,
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