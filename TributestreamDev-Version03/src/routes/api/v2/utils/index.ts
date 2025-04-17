/**
 * Utility exports for the API v2 endpoints
 */

// Error handling utilities
export * from './error-handler';

// Response formatting utilities
export * from './response-formatter';

// Validation utilities
export * from './validation';

// Authentication utilities
export * from './auth-utils';

// WordPress API client
export * from './wp-api-client';

/**
 * Parse query parameters from a URL search params object
 * @param searchParams URL search params
 * @returns Parsed query parameters
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Extract pagination parameters
  if (searchParams.has('page')) {
    params.page = parseInt(searchParams.get('page') || '1', 10);
  }
  
  if (searchParams.has('per_page')) {
    params.per_page = parseInt(searchParams.get('per_page') || '10', 10);
  }
  
  // Extract sorting parameters
  if (searchParams.has('sort_by')) {
    params.sort_by = searchParams.get('sort_by');
  }
  
  if (searchParams.has('sort_order')) {
    params.sort_order = searchParams.get('sort_order');
  }
  
  // Extract search parameter
  if (searchParams.has('search')) {
    params.search = searchParams.get('search');
  }
  
  // Extract filter parameters (any other parameters)
  for (const [key, value] of searchParams.entries()) {
    if (!['page', 'per_page', 'sort_by', 'sort_order', 'search'].includes(key)) {
      // Try to parse as number if possible
      if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else {
        params[key] = value;
      }
    }
  }
  
  return params;
}

/**
 * Get pagination parameters from query parameters
 * @param params Query parameters
 * @returns Pagination parameters
 */
export function getPaginationParams(params: Record<string, any>): { page: number; per_page: number } {
  const page = params.page && params.page > 0 ? params.page : 1;
  const per_page = params.per_page && params.per_page > 0 ? params.per_page : 10;
  
  return { page, per_page };
}

/**
 * Get sorting parameters from query parameters
 * @param params Query parameters
 * @param defaultSortBy Default sort field
 * @param defaultSortOrder Default sort order
 * @returns Sorting parameters
 */
export function getSortingParams(
  params: Record<string, any>,
  defaultSortBy: string = 'id',
  defaultSortOrder: 'asc' | 'desc' = 'asc'
): { sort_by: string; sort_order: 'asc' | 'desc' } {
  const sort_by = params.sort_by || defaultSortBy;
  const sort_order = (params.sort_order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
  
  return { sort_by, sort_order };
}