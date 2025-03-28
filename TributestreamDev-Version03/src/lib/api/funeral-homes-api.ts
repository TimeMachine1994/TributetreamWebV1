/**
 * Funeral Homes API Client
 * 
 * Provides methods for interacting with the funeral homes endpoints of the TributeStream API.
 */

import { tributeApi } from './tribute-api-client';
import type { ApiResponse } from './tribute-api-client';
import { FUNERAL_HOMES_PATH } from './api-constants';
import type {
  FuneralHome,
  CreateFuneralHomeParams,
  UpdateFuneralHomeParams,
  PaginatedFuneralHomesResponse
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
  async getFuneralHomes(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedFuneralHomesResponse>> {
    const { page = 1, perPage = 10 } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    return tributeApi['request']<PaginatedFuneralHomesResponse>(
      `${FUNERAL_HOMES_PATH}?${queryParams.toString()}`
    );
  },
  
  /**
   * Alias for getFuneralHomes (for backward compatibility)
   * 
   * @param options Pagination options
   * @returns List of funeral homes
   */
  async getAllFuneralHomes(options: { page?: number; perPage?: number } = {}): Promise<ApiResponse<PaginatedFuneralHomesResponse>> {
    return this.getFuneralHomes(options);
  },
  
  /**
   * Get a funeral home by ID
   * 
   * @param id Funeral home ID
   * @returns Funeral home data
   */
  async getFuneralHomeById(id: number): Promise<ApiResponse<{ data: FuneralHome }>> {
    return tributeApi['request']<{ data: FuneralHome }>(
      `${FUNERAL_HOMES_PATH}/${id}`
    );
  },
  
  /**
   * Create a new funeral home
   * 
   * @param data Funeral home data
   * @returns Created funeral home ID
   */
  async createFuneralHome(data: CreateFuneralHomeParams): Promise<ApiResponse<{ funeral_home_id: number }>> {
    return tributeApi['request']<{ funeral_home_id: number }>(
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
   * @param id Funeral home ID
   * @param data Updated funeral home data
   * @returns Update result
   */
  async updateFuneralHome(
    id: number,
    data: UpdateFuneralHomeParams
  ): Promise<ApiResponse<{ funeral_home_id: number }>> {
    return tributeApi['request']<{ funeral_home_id: number }>(
      `${FUNERAL_HOMES_PATH}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Delete a funeral home
   * 
   * @param id Funeral home ID
   * @returns Delete result
   */
  async deleteFuneralHome(id: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApi['request']<{ deleted_id: number }>(
      `${FUNERAL_HOMES_PATH}/${id}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default funeralHomesApi;