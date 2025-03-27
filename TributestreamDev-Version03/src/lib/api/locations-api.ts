/**
 * Locations API Client
 * 
 * Provides methods for interacting with the locations endpoints of the TributeStream API.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import { LOCATIONS_PATH, TRIBUTE_PAGES_PATH } from './api-constants';
import type { ApiResponse } from '$lib/server/types';
import type {
  Location,
  PaginatedLocationsResponse,
  CreateLocationParams,
  UpdateLocationParams,
  CreateLocationResponse
} from '$lib/server/types';

/**
 * Locations API Client
 */
export const locationsApi = {
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
    
    return tributeApiV2.request<PaginatedLocationsResponse>(
      `${LOCATIONS_PATH}?${queryParams.toString()}`
    );
  },

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
    
    return tributeApiV2.request<PaginatedLocationsResponse>(
      `${TRIBUTE_PAGES_PATH}/${tributeId}/locations?${queryParams.toString()}`
    );
  },

  /**
   * Get a location by ID
   * 
   * @param locationId Location ID
   * @returns Location data
   */
  async getLocationById(locationId: number): Promise<ApiResponse<{ data: Location }>> {
    return tributeApiV2.request<{ data: Location }>(
      `${LOCATIONS_PATH}/${locationId}`
    );
  },

  /**
   * Create a new location
   * 
   * @param data Location data
   * @returns Created location ID
   */
  async createLocation(data: CreateLocationParams): Promise<ApiResponse<CreateLocationResponse>> {
    return tributeApiV2.request<CreateLocationResponse>(
      `${LOCATIONS_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

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
    return tributeApiV2.request<{ location_id: number }>(
      `${LOCATIONS_PATH}/${locationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Delete a location
   * 
   * @param locationId Location ID
   * @returns Delete result
   */
  async deleteLocation(locationId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${LOCATIONS_PATH}/${locationId}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default locationsApi;