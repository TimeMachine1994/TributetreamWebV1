/**
 * Schedules API Client
 * 
 * Provides methods for interacting with the schedules endpoints of the TributeStream API.
 */

import { tributeApiV2 } from './tribute-api-client-v2';
import { SCHEDULES_PATH } from './api-constants';
import type { ApiResponse } from '$lib/server/types';
import type {
  Schedule,
  PaginatedSchedulesResponse,
  CreateScheduleParams,
  UpdateScheduleParams,
  CreateScheduleResponse
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
    
    return tributeApiV2.request<PaginatedSchedulesResponse>(
      `${SCHEDULES_PATH}?${queryParams.toString()}`
    );
  },

  /**
   * Get a schedule by ID
   * 
   * @param scheduleId Schedule ID
   * @returns Schedule data
   */
  async getScheduleById(scheduleId: number): Promise<ApiResponse<{ data: Schedule }>> {
    return tributeApiV2.request<{ data: Schedule }>(
      `${SCHEDULES_PATH}/${scheduleId}`
    );
  },

  /**
   * Create a new schedule
   * 
   * @param data Schedule data
   * @returns Created schedule ID
   */
  async createSchedule(data: CreateScheduleParams): Promise<ApiResponse<CreateScheduleResponse>> {
    return tributeApiV2.request<CreateScheduleResponse>(
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
   * @param scheduleId Schedule ID
   * @param data Updated schedule data
   * @returns Update result
   */
  async updateSchedule(
    scheduleId: number,
    data: UpdateScheduleParams
  ): Promise<ApiResponse<{ schedule_id: number }>> {
    return tributeApiV2.request<{ schedule_id: number }>(
      `${SCHEDULES_PATH}/${scheduleId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Delete a schedule
   * 
   * @param scheduleId Schedule ID
   * @returns Delete result
   */
  async deleteSchedule(scheduleId: number): Promise<ApiResponse<{ deleted_id: number }>> {
    return tributeApiV2.request<{ deleted_id: number }>(
      `${SCHEDULES_PATH}/${scheduleId}`,
      {
        method: 'DELETE'
      }
    );
  }
};

export default schedulesApi;