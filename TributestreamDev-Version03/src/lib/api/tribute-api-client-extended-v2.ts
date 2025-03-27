/**
 * Extended TributeStream API Client (V2)
 *
 * Extends the base TributeApiClientV2 with additional methods for events, locations, users,
 * funeral homes, and schedules.
 */

import { TributeApiClientV2, tributeApiV2 } from './tribute-api-client-v2';
import type {
  ApiResponse,
  PaginatedTributePagesResponse
} from '$lib/server/types';
import {
  EVENTS_PATH,
  ACTIVE_EVENTS_PATH,
  LOCATIONS_PATH,
  USERS_PATH,
  TRIBUTE_PAGES_PATH,
  FUNERAL_HOMES_PATH,
  SCHEDULES_PATH
} from './api-constants';
import type { 
  Event, 
  Location, 
  User, 
  TributePage,
  CreateEventParams,
  UpdateEventParams,
  CreateEventResponse,
  PaginatedEventsResponse,
  PaginatedLocationsResponse,
  CreateLocationParams,
  UpdateLocationParams,
  CreateLocationResponse,
  PaginatedUsersResponse,
  FuneralHome,
  PaginatedFuneralHomesResponse,
  CreateFuneralHomeParams,
  UpdateFuneralHomeParams,
  CreateFuneralHomeResponse,
  Schedule,
  PaginatedSchedulesResponse,
  CreateScheduleParams,
  UpdateScheduleParams,
  CreateScheduleResponse
} from '$lib/server/types';

/**
 * Extended API Client Class
 */
export class ExtendedTributeApiClientV2 extends TributeApiClientV2 {
  /**
   * Get all tributes (admin only)
   * 
   * @returns All tributes
   */
  async getAllTributes(): Promise<ApiResponse<PaginatedTributePagesResponse>> {
    return this.request<PaginatedTributePagesResponse>(
      `${TRIBUTE_PAGES_PATH}`
    );
  }

  // ------------------------------------------------------------------------
  // EVENTS METHODS
  // ------------------------------------------------------------------------

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
    
    return this.request<PaginatedEventsResponse>(
      `${EVENTS_PATH}?${queryParams.toString()}`
    );
  }

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
    
    return this.request<PaginatedEventsResponse>(
      `${ACTIVE_EVENTS_PATH}?${queryParams.toString()}`
    );
  }

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
    
    return this.request<PaginatedEventsResponse>(
      `${LOCATIONS_PATH}/${locationId}/events?${queryParams.toString()}`
    );
  }

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
    
    return this.request<PaginatedEventsResponse>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/events?${queryParams.toString()}`
    );
  }

  /**
   * Create a new event
   * 
   * @param data Event data
   * @returns Created event ID
   */
  async createEvent(data: CreateEventParams): Promise<ApiResponse<CreateEventResponse>> {
    return this.request<CreateEventResponse>(
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
    eventId: number,
    data: UpdateEventParams
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(
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
  async deleteEvent(eventId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${EVENTS_PATH}/${eventId}`,
      {
        method: 'DELETE'
      }
    );
  }

  // ------------------------------------------------------------------------
  // LOCATIONS METHODS
  // ------------------------------------------------------------------------

  /**
   * Get all locations with pagination
   * 
   * @param options Pagination options
   * @returns List of all locations
   */
  async getAllLocations(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedLocationsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return this.request<PaginatedLocationsResponse>(
      `${LOCATIONS_PATH}?${queryParams.toString()}`
    );
  }

  /**
   * Get locations for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @param options Pagination options
   * @returns Locations for the tribute
   */
  async getLocationsByTribute(
    tributeId: number, 
    options: { page?: number; perPage?: number } = {}
  ): Promise<ApiResponse<PaginatedLocationsResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return this.request<PaginatedLocationsResponse>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/locations?${queryParams.toString()}`
    );
  }

  /**
   * Get a location by ID
   * 
   * @param locationId Location ID
   * @returns Location data
   */
  async getLocationById(locationId: number): Promise<ApiResponse<{ data: Location }>> {
    return this.request<{ data: Location }>(
      `${LOCATIONS_PATH}/${locationId}`
    );
  }

  /**
   * Create a new location
   * 
   * @param data Location data
   * @returns Created location ID
   */
  async createLocation(data: CreateLocationParams): Promise<ApiResponse<CreateLocationResponse>> {
    return this.request<CreateLocationResponse>(
      `${LOCATIONS_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update an existing location
   * 
   * @param locationId Location ID
   * @param data Updated location data
   * @returns Update result
   */
  async updateLocation(
    locationId: number,
    data: UpdateLocationParams
  ): Promise<ApiResponse<{ location_id: number }>> {
    return this.request<{ location_id: number }>(
      `${LOCATIONS_PATH}/${locationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Delete a location
   * 
   * @param locationId Location ID
   * @returns Delete result
   */
  async deleteLocation(locationId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${LOCATIONS_PATH}/${locationId}`,
      {
        method: 'DELETE'
      }
    );
  }

  // ------------------------------------------------------------------------
  // USERS METHODS
  // ------------------------------------------------------------------------

  /**
   * Get all users (admin only)
   * 
   * @param options Pagination and search options
   * @returns List of users
   */
  async getAllUsers(options: { 
    page?: number; 
    perPage?: number; 
    search?: string;
    role?: string;
  } = {}): Promise<ApiResponse<PaginatedUsersResponse>> {
    const { page = 1, perPage = 10, search = '', role = '' } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (search) {
      queryParams.append('search', search);
    }
    
    if (role) {
      queryParams.append('role', role);
    }
    
    return this.request<PaginatedUsersResponse>(
      `${USERS_PATH}?${queryParams.toString()}`
    );
  }

  /**
   * Get current user information with role
   * 
   * @returns User information
   */
  async getCurrentUser(): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(
      `${USERS_PATH}/me`
    );
  }

  /**
   * Get a user by ID
   * 
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: number): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(
      `${USERS_PATH}/${userId}`
    );
  }

  // ------------------------------------------------------------------------
  // FUNERAL HOMES METHODS
  // ------------------------------------------------------------------------

  /**
   * Get all funeral homes with pagination
   * 
   * @param options Pagination options
   * @returns List of funeral homes
   */
  async getAllFuneralHomes(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedFuneralHomesResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return this.request<PaginatedFuneralHomesResponse>(
      `${FUNERAL_HOMES_PATH}?${queryParams.toString()}`
    );
  }

  /**
   * Get a funeral home by ID
   * 
   * @param funeralHomeId Funeral home ID
   * @returns Funeral home data
   */
  async getFuneralHomeById(funeralHomeId: number): Promise<ApiResponse<{ data: FuneralHome }>> {
    return this.request<{ data: FuneralHome }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`
    );
  }

  /**
   * Create a new funeral home
   * 
   * @param data Funeral home data
   * @returns Created funeral home ID
   */
  async createFuneralHome(data: CreateFuneralHomeParams): Promise<ApiResponse<CreateFuneralHomeResponse>> {
    return this.request<CreateFuneralHomeResponse>(
      `${FUNERAL_HOMES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update an existing funeral home
   * 
   * @param funeralHomeId Funeral home ID
   * @param data Updated funeral home data
   * @returns Update result
   */
  async updateFuneralHome(
    funeralHomeId: number,
    data: UpdateFuneralHomeParams
  ): Promise<ApiResponse<{ funeral_home_id: number }>> {
    return this.request<{ funeral_home_id: number }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Delete a funeral home
   * 
   * @param funeralHomeId Funeral home ID
   * @returns Delete result
   */
  async deleteFuneralHome(funeralHomeId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`,
      {
        method: 'DELETE'
      }
    );
  }

  // ------------------------------------------------------------------------
  // SCHEDULES METHODS
  // ------------------------------------------------------------------------

  /**
   * Get all schedules with pagination
   * 
   * @param options Pagination options
   * @returns List of schedules
   */
  async getAllSchedules(options: { 
    page?: number; 
    perPage?: number;
    tributeId?: number;
  } = {}): Promise<ApiResponse<PaginatedSchedulesResponse>> {
    const { page = 1, perPage = 10, tributeId } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (tributeId) {
      queryParams.append('tribute_id', tributeId.toString());
    }
    
    return this.request<PaginatedSchedulesResponse>(
      `${SCHEDULES_PATH}?${queryParams.toString()}`
    );
  }

  /**
   * Get a schedule by ID
   * 
   * @param scheduleId Schedule ID
   * @returns Schedule data
   */
  async getScheduleById(scheduleId: number): Promise<ApiResponse<{ data: Schedule }>> {
    return this.request<{ data: Schedule }>(
      `${SCHEDULES_PATH}/${scheduleId}`
    );
  }

  /**
   * Create a new schedule
   * 
   * @param data Schedule data
   * @returns Created schedule ID
   */
  async createSchedule(data: CreateScheduleParams): Promise<ApiResponse<CreateScheduleResponse>> {
    return this.request<CreateScheduleResponse>(
      `${SCHEDULES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Update an existing schedule
   * 
   * @param scheduleId Schedule ID
   * @param data Updated schedule data
   * @returns Update result
   */
  async updateSchedule(
    scheduleId: number,
    data: UpdateScheduleParams
  ): Promise<ApiResponse<{ schedule_id: number }>> {
    return this.request<{ schedule_id: number }>(
      `${SCHEDULES_PATH}/${scheduleId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }

  /**
   * Delete a schedule
   * 
   * @param scheduleId Schedule ID
   * @returns Delete result
   */
  async deleteSchedule(scheduleId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return this.request<{ deleted_id: number }>(
      `${SCHEDULES_PATH}/${scheduleId}`,
      {
        method: 'DELETE'
      }
    );
  }
}

/**
 * Create a singleton instance for global use
 */
export const extendedTributeApiV2 = new ExtendedTributeApiClientV2();

/**
 * Export default instance
 */
export default extendedTributeApiV2;