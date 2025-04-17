/**
 * Base interfaces for the API v2 endpoints
 */

/**
 * Base response interface for all API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    pagination?: PaginationMeta;
  };
}

/**
 * Error interface for standardized error responses
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Authentication token interface
 */
export interface AuthToken {
  token: string;
  expires_at: string;
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}