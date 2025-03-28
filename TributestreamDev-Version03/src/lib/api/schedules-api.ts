/**
 * Schedules API Client
 * 
 * Provides methods for interacting with the schedules endpoints of the TributeStream API.
 */

import { tributeApi } from './tribute-api-client';
import type { ApiResponse } from './tribute-api-client';
import { SCHEDULES_PATH } from './api-constants';
import type {
  Schedule,
  CreateScheduleParams,
  UpdateScheduleParams,
  PaginatedSchedulesResponse
} from '$lib/server/types';

/**
 * Schedules API Client
 */
export const schedulesApi = {
  /**
   * Get all schedules with pagination
   * 
   * @param options Pagination options
   * @returns List of schedules
   */
  async getSchedules(options: { page?: number; perPage?: number; tributeId?: number } = {}): Promise<ApiResponse<PaginatedSchedulesResponse>> {
    const { page = 1, perPage = 10, tributeId } = options;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (tributeId) {
      queryParams.append('tribute_id', tributeId.toString());
    }
    
    return tributeApi['request']<PaginatedSchedulesResponse>(
      `${SCHEDULES_PATH}?${queryParams.toString()}`
    );
  },
  
  /**
   * Alias for getSchedules (for backward compatibility)
   * 
   * @param options Pagination options
   * @returns List of schedules
   */
  async getAllSchedules(options: { page?: number; perPage?: number; tributeId?: number } = {}): Promise<ApiResponse<PaginatedSchedulesResponse>> {
    return this.getSchedules(options);
  },
  
  /**
   * Get a schedule by ID
   * 
   * @param id Schedule ID
   * @returns Schedule data
   */
  async getScheduleById(id: number): Promise<ApiResponse<{ data: Schedule }>> {
    return tributeApi['request']<{ data: Schedule }>(
      `${SCHEDULES_PATH}/${id}`
    );
  },
  
  /**
   * Create a new schedule
   * 
   * @param data Schedule data
   * @returns Created schedule ID
   */
  async createSchedule(data: CreateScheduleParams): Promise<ApiResponse<{ schedule_id: number; tribute_id: number }>> {
    return tributeApi['request']<{ schedule_id: number; tribute_id: number }>(
      `${SCHEDULES_PATH}`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Update an existing schedule
   * 
   * @param id Schedule ID
   * @param data Updated schedule data
   * @returns Update result
   */
  async updateSchedule(
    id: number,
    data: UpdateScheduleParams
  ): Promise<ApiResponse<{ schedule_id: number }>> {
    return tributeApi['request']<{ schedule_id: number }>(
      `${SCHEDULES_PATH}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },
  
  /**
   * Delete a schedule
   * 
   * @param id Schedule ID
   * @returns Delete result
   */
  async deleteSchedule(id: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApi['request']<{ deleted_id: number }>(
      `${SCHEDULES_PATH}/${id}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default schedulesApi;