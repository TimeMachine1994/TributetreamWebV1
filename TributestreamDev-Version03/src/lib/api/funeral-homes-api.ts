/**
 * Funeral Homes API Client
 * 
 * Provides methods for interacting with the funeral homes endpoints of the TributeStream API.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import { FUNERAL_HOMES_PATH } from './api-constants';
import type { ApiResponse } from '$lib/server/types';
import type {
  FuneralHome,
  PaginatedFuneralHomesResponse,
  CreateFuneralHomeParams,
  UpdateFuneralHomeParams,
  CreateFuneralHomeResponse
} from '$lib/server/types';

/**
 * Funeral Homes API Client
 */
export const funeralHomesApi = {
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
    
    return tributeApiV2.request<PaginatedFuneralHomesResponse>(
      `${FUNERAL_HOMES_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Get a funeral home by ID
   * 
   * @param funeralHomeId Funeral home ID
   * @returns Funeral home data
   */
  async getFuneralHomeById(funeralHomeId: number): Promise<ApiResponse<{ data: FuneralHome }>> {
    return tributeApiV2.request<{ data: FuneralHome }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`
    );
  },

  /**
   * Create a new funeral home
   * 
   * @param data Funeral home data
   * @returns Created funeral home ID
   */
  async createFuneralHome(data: CreateFuneralHomeParams): Promise<ApiResponse<CreateFuneralHomeResponse>> {
    return tributeApiV2.request<CreateFuneralHomeResponse>(
      `${FUNERAL_HOMES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

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
    return tributeApiV2.request<{ funeral_home_id: number }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Delete a funeral home
   * 
   * @param funeralHomeId Funeral home ID
   * @returns Delete result
   */
  async deleteFuneralHome(funeralHomeId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${FUNERAL_HOMES_PATH}/${funeralHomeId}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default funeralHomesApi;