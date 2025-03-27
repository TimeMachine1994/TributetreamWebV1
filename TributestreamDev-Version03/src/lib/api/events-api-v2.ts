/**
 * Events API Client (V2)
 * 
 * Provides methods for interacting with the events-related endpoints of the TributeStream API.
 * This version is updated to work with the new API endpoints.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import {
  EVENTS_PATH,
  ACTIVE_EVENTS_PATH,
  LOCATIONS_PATH,
  TRIBUTE_PAGES_PATH
} from './api-constants';
import type { ApiResponse } from '$lib/server/types';
import type {
  Event,
  PaginatedEventsResponse,
  CreateEventParams,
  UpdateEventParams,
  CreateEventResponse
} from '$lib/server/types';

/**
 * Events API Client
 */
export const eventsApiV2 = {
  /**
   * Get all events with pagination
   * 
   * @param options Pagination options
   * @returns List of all events
   */
  async getAllEvents(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedEventsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return tributeApiV2.request<PaginatedEventsResponse>(
      `${EVENTS_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Get active events (not ended yet)
   * 
   * @param options Pagination options
   * @returns List of active events
   */
  async getActiveEvents(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedEventsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return tributeApiV2.request<PaginatedEventsResponse>(
      `${ACTIVE_EVENTS_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Get events for a specific location
   * 
   * @param locationId Location ID
   * @param options Pagination options
   * @returns Events for the location
   */
  async getEventsByLocation(
    locationId: number, 
    options: { page?: number; perPage?: number } = {}
  ): Promise<ApiResponse<PaginatedEventsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return tributeApiV2.request<PaginatedEventsResponse>(
      `${LOCATIONS_PATH}/${locationId}/events?${queryParams.toString()}`
    );
  },

  /**
   * Get events for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @param options Pagination options
   * @returns Events for the tribute
   */
  async getEventsByTribute(
    tributeId: number, 
    options: { page?: number; perPage?: number } = {}
  ): Promise<ApiResponse<PaginatedEventsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return tributeApiV2.request<PaginatedEventsResponse>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/events?${queryParams.toString()}`
    );
  },

  /**
   * Get a single event by ID
   * 
   * @param eventId Event ID
   * @returns Event data
   */
  async getEventById(eventId: number): Promise<ApiResponse<{ data: Event }>> {
    return tributeApiV2.request<{ data: Event }>(
      `${EVENTS_PATH}/${eventId}`
    );
  },

  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: CreateEventParams): Promise<ApiResponse<CreateEventResponse>> {
    return tributeApiV2.request<CreateEventResponse>(
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
    eventId: number,
    data: UpdateEventParams
  ): Promise<ApiResponse<{ success: boolean }>> {
    return tributeApiV2.request<{ success: boolean }>(
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
  async deleteEvent(eventId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default eventsApiV2;