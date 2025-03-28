/**
 * Locations API Client
 * 
 * Provides methods for interacting with the locations endpoints of the TributeStream API.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import type { ApiResponse } from './tribute-api-client';
import { LOCATIONS_PATH, TRIBUTE_PAGES_PATH } from './api-constants';
import type {
  Location,
  CreateLocationParams,
  UpdateLocationParams,
  PaginatedLocationsResponse
} from '$lib/server/types';

/**
 * Locations API Client
 */
export const locationsApi = {
  /**
   * Get all locations with pagination
   * 
   * @param options Pagination options
   * @returns List of locations
   */
  async getLocations(options: { page?: number; perPage?: number; tributeId?: number } = {}): Promise<ApiResponse<PaginatedLocationsResponse>> {
    const { page = 1, perPage = 10, tributeId } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (tributeId) {
      queryParams.append('tribute_id', tributeId.toString());
    }
    
    return tributeApiV2.request<PaginatedLocationsResponse>(
      `${LOCATIONS_PATH}?${queryParams.toString()}`
    );
  },
  
  /**
   * Alias for getLocations (for backward compatibility)
   * 
   * @param options Pagination options
   * @returns List of locations
   */
  async getAllLocations(options: { page?: number; perPage?: number; tributeId?: number } = {}): Promise<ApiResponse<PaginatedLocationsResponse>> {
    return this.getLocations(options);
  },
  
  /**
   * Get a location by ID
   * 
   * @param id Location ID
   * @returns Location data
   */
  async getLocationById(id: number): Promise<ApiResponse<{ data: Location }>> {
    return tributeApiV2.request<{ data: Location }>(
      `${LOCATIONS_PATH}/${id}`
    );
  },
  
  /**
   * Get locations for a specific tribute
   * 
   * @param tributeId Tribute ID
   * @returns Locations for the tribute
   */
  async getLocationsByTribute(tributeId: number | string): Promise<ApiResponse<Location[]>> {
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
  },
  
  /**
   * Create a new location
   * 
   * @param data Location data
   * @returns Created location ID
   */
  async createLocation(data: CreateLocationParams): Promise<ApiResponse<{ location_id: number; tribute_id: number }>> {
    return tributeApiV2.request<{ location_id: number; tribute_id: number }>(
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
   * @param id Location ID
   * @param data Updated location data
   * @returns Update result
   */
  async updateLocation(
    id: number,
    data: UpdateLocationParams
  ): Promise<ApiResponse<{ location_id: number }>> {
    return tributeApiV2.request<{ location_id: number }>(
      `${LOCATIONS_PATH}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Delete a location
   * 
   * @param id Location ID
   * @returns Delete result
   */
  async deleteLocation(id: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${LOCATIONS_PATH}/${id}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default locationsApi;