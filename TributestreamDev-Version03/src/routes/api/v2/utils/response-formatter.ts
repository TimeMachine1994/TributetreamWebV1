/**
 * Response formatting utilities for the API v2 endpoints
 */
import { json } from '@sveltejs/kit';
import type { ApiResponse, PaginationMeta } from '../types';

/**
 * Format a successful API response
 * @param data The data to include in the response
 * @param status The HTTP status code
 * @param meta Additional metadata to include in the response
 * @returns A standardized JSON response
 */
export function formatResponse<T>(
  data: T, 
  status: number = 200, 
  meta?: { pagination?: PaginationMeta; [key: string]: any }
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta
  };
  
  return json(response, { status });
}

/**
 * Format a paginated API response
 * @param data The data to include in the response
 * @param total The total number of items
 * @param page The current page number
 * @param per_page The number of items per page
 * @param status The HTTP status code
 * @param additionalMeta Additional metadata to include in the response
 * @returns A standardized JSON response with pagination metadata
 */
export function formatPaginatedResponse<T>(
  data: T,
  total: number,
  page: number,
  per_page: number,
  status: number = 200,
  additionalMeta?: { [key: string]: any }
): Response {
  const total_pages = Math.ceil(total / per_page);
  
  const meta = {
    pagination: {
      total,
      page,
      per_page,
      total_pages
    },
    ...additionalMeta
  };
  
  return formatResponse(data, status, meta);
}

/**
 * Format a created resource response
 * @param data The created resource data
 * @param resourceName The name of the created resource
 * @returns A standardized JSON response for a created resource
 */
export function formatCreatedResponse<T>(data: T, resourceName: string = 'Resource'): Response {
  return formatResponse(
    data,
    201,
    { message: `${resourceName} created successfully` }
  );
}

/**
 * Format an updated resource response
 * @param data The updated resource data
 * @param resourceName The name of the updated resource
 * @returns A standardized JSON response for an updated resource
 */
export function formatUpdatedResponse<T>(data: T, resourceName: string = 'Resource'): Response {
  return formatResponse(
    data,
    200,
    { message: `${resourceName} updated successfully` }
  );
}

/**
 * Format a deleted resource response
 * @param id The ID of the deleted resource
 * @param resourceName The name of the deleted resource
 * @returns A standardized JSON response for a deleted resource
 */
export function formatDeletedResponse(id: number | string, resourceName: string = 'Resource'): Response {
  return formatResponse(
    { id },
    200,
    { message: `${resourceName} deleted successfully` }
  );
}