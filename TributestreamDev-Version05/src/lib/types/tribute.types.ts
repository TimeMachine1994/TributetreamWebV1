/**
 * Tribute types for the WordPress plugin
 */

/**
 * Tribute entity from the WordPress plugin
 */
export interface Tribute {
  id: number;
  user_id: number;
  loved_one_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  custom_html: string | null;
  phone_number: string;
  number_of_streams: number;
}

/**
 * Input for creating a tribute
 */
export interface TributeCreateInput {
  user_id: number;
  loved_one_name: string;
  slug?: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
}

/**
 * Input for updating a tribute
 */
export interface TributeUpdateInput {
  loved_one_name?: string;
  slug?: string;
  custom_html?: string;
  phone_number?: string;
  number_of_streams?: number;
}

/**
 * Extended tribute data
 */
export interface TributeExtendedData {
  tribute_reference: number;
  [key: string]: any;
}

/**
 * Paginated response for tributes
 */
export interface TributePaginatedResponse {
  tributes: Tribute[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Success response
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
  updated_rows?: number;
  deleted_rows?: number;
  id?: number;
  slug?: string;
}