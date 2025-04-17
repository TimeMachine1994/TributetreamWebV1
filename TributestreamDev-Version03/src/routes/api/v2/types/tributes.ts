/**
 * Tribute-specific interfaces for the API v2 endpoints
 */
import type { ApiResponse } from './index';

/**
 * Tribute interface representing a tribute page
 */
export interface Tribute {
  tribute_id: number;
  created_by_user_id: number;
  point_of_contact_user_id?: number;
  loved_ones_name: string;
  slugified_name: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request for creating a new tribute
 */
export interface TributeCreateRequest {
  created_by_user_id: number;
  point_of_contact_user_id?: number;
  loved_ones_name: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Request for updating an existing tribute
 */
export interface TributeUpdateRequest {
  created_by_user_id?: number;
  point_of_contact_user_id?: number;
  loved_ones_name?: string;
  slugified_name?: string;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}

/**
 * Response for a single tribute
 */
export interface TributeResponse extends ApiResponse {
  data?: Tribute;
}

/**
 * Response for a list of tributes
 */
export interface TributesListResponse extends ApiResponse {
  data?: Tribute[];
}

/**
 * Query parameters for listing tributes
 */
export interface TributeListQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  user_id?: number;
  sort_by?: 'loved_ones_name' | 'created_at' | 'loved_ones_dod';
  sort_order?: 'asc' | 'desc';
}

/**
 * Tribute schedule interface
 */
export interface TributeSchedule {
  schedule_id: number;
  tribute_id: number;
  funeral_director_user_id?: number;
  number_of_days?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request for creating a tribute schedule
 */
export interface TributeScheduleCreateRequest {
  tribute_id: number;
  funeral_director_user_id?: number;
  number_of_days?: number;
}

/**
 * Request for updating a tribute schedule
 */
export interface TributeScheduleUpdateRequest {
  funeral_director_user_id?: number;
  number_of_days?: number;
}

/**
 * Response for a tribute schedule
 */
export interface TributeScheduleResponse extends ApiResponse {
  data?: TributeSchedule;
}