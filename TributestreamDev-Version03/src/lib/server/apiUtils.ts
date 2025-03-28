/**
 * API Utilities
 * 
 * Contains utility functions for processing API requests and responses.
 */

import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { ApiResponse } from './types';

// WordPress API base URL
const WORDPRESS_API_BASE_URL = env.WORDPRESS_API_URL || 'https://wp.tributestream.com/wp-json';

// Funeral API path (previously TributeStream API path)
export const FUNERAL_API_PATH = '/funeral/v2';

// Keep the old path for backward compatibility during transition
export const TRIBUTESTREAM_API_PATH = '/funeral/v2';

/**
 * Create a standardized success response
 * 
 * @param data Response data
 * @returns Standardized API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Create a standardized error response
 * 
 * @param code Error code
 * @param message Error message
 * @param status HTTP status code
 * @returns Standardized API error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number
): ApiResponse<never> {
  return {
    success: false,
    error: message,
    code,
    status
  };
}

/**
 * Parse JSON body from request
 * 
 * @param request Request object
 * @returns Parsed body as specified type
 * @throws Error if body is invalid JSON
 */
export async function getJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    console.error('Error parsing request body:', error);
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate that required fields are present in an object
 * 
 * @param data Object to validate
 * @param requiredFields Array of required field names
 * @returns Error response if validation fails, null otherwise
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): Response | null {
  const missingFields = requiredFields.filter(field => {
    return data[field] === undefined || data[field] === null || data[field] === '';
  });

  if (missingFields.length > 0) {
    const response = new Response(
      JSON.stringify(
        createErrorResponse(
          'MISSING_FIELDS',
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        )
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response;
  }
  
  return null;
}

/**
 * Forward a request to the WordPress API
 * 
 * @param event SvelteKit request event
 * @param path WordPress API endpoint path (relative to base URL)
 * @param options Fetch options
 * @returns API response
 */
export async function forwardRequestToWordPress<T>(
  event: RequestEvent,
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Construct the full URL
    const apiUrl = `${WORDPRESS_API_BASE_URL}${path}`;
    
    // Set up default headers
    const headers = new Headers(options.headers || {});
    
    // If Content-Type is not set and method is not GET, set it to application/json
    if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }
    
    // Forward the Authorization header if present in the original request
    const authHeader = event.request.headers.get('Authorization');
    if (authHeader && !headers.has('Authorization')) {
      headers.set('Authorization', authHeader);
    }
    
    // Create the final request options
    const requestOptions: RequestInit = {
      ...options,
      headers
    };
    
    // Make the request to WordPress
    console.log(`forwardRequestToWordPress - Making request to: ${apiUrl}`);
    console.log(`forwardRequestToWordPress - Using event.fetch: ${!!event.fetch}`);
    console.log(`forwardRequestToWordPress - Request options:`, requestOptions);
    
    // Use event.fetch instead of global fetch
    const response = await event.fetch(apiUrl, requestOptions);
    
    // Parse the response
    let responseData: unknown;
    let errorMessage = '';
    
    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        responseData = null;
        errorMessage = 'Error parsing response from WordPress';
      }
    } else {
      // Handle non-JSON responses
      try {
        responseData = await response.text();
      } catch (error) {
        console.error('Error reading response text:', error);
        responseData = null;
        errorMessage = 'Error reading response from WordPress';
      }
    }
    
    // Check for WordPress API errors
    if (!response.ok) {
      // WordPress sometimes returns errors as objects with message or code properties
      if (typeof responseData === 'object' && responseData !== null) {
        const errorData = responseData as Record<string, unknown>;
        errorMessage =
          (errorData.message as string) ||
          (errorData.error as string) ||
          (errorData.code as string) ||
          'WordPress API error';
      } else if (typeof responseData === 'string' && responseData.length > 0) {
        errorMessage = responseData;
      } else {
        errorMessage = `WordPress API error: ${response.status} ${response.statusText}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        code: typeof responseData === 'object' && responseData !== null
          ? ((responseData as Record<string, unknown>).code as string) || 'WP_API_ERROR'
          : 'WP_API_ERROR'
      };
    }
    
    // Return successful response
    return {
      success: true,
      data: responseData as T,
      status: response.status
    };
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error forwarding request to WordPress:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error contacting WordPress API',
      status: 500,
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Transform error response from WordPress to our standard format
 *
 * @param error WordPress error response
 * @returns Standardized API error response
 */
export function transformWordPressError(error: unknown): ApiResponse<never> {
  // Default values
  let errorCode = 'WP_API_ERROR';
  let errorMessage = 'An error occurred while communicating with WordPress';
  let statusCode = 500;
  
  // Extract information from WordPress error response
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Extract error code
    if (errorObj.code && typeof errorObj.code === 'string') {
      errorCode = errorObj.code;
    }
    
    // Extract error message
    if (errorObj.message && typeof errorObj.message === 'string') {
      errorMessage = errorObj.message;
    } else if (errorObj.error && typeof errorObj.error === 'string') {
      errorMessage = errorObj.error;
    }
    
    // Extract status code
    if (
      errorObj.data &&
      typeof errorObj.data === 'object' &&
      errorObj.data !== null &&
      'status' in errorObj.data &&
      typeof (errorObj.data as Record<string, unknown>).status === 'number'
    ) {
      statusCode = (errorObj.data as Record<string, unknown>).status as number;
    } else if (errorObj.status && typeof errorObj.status === 'number') {
      statusCode = errorObj.status;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Create the standardized error response
  return createErrorResponse(
    errorCode,
    errorMessage,
    statusCode
  );
}

/**
 * Safely get a number parameter from a URL parameter
 * 
 * @param param Parameter value from URL
 * @param defaultValue Default value if parameter is invalid
 * @returns Number value
 */
export function getNumberParam(param: string | undefined, defaultValue: number): number {
  if (!param) {
    return defaultValue;
  }
  
  const parsed = parseInt(param, 10);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Build query parameters for WordPress API requests
 * 
 * @param params Object containing parameter values
 * @returns URLSearchParams object
 */
export function buildQueryParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  }
  
  return queryParams;
}

/**
 * Build query string for WordPress API requests (alias for buildQueryParams)
 *
 * @param params Object containing parameter values
 * @returns Query string
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  return buildQueryParams(params).toString();
}

/**
 * Forward an API request to the WordPress API
 *
 * A simplified wrapper around forwardRequestToWordPress
 *
 * @param options Options for forwarding the request
 * @returns Response data
 */
export async function forwardApiRequest(options: {
  path: string;
  request: Request;
  fetch: typeof fetch;
  method?: string;
  queryParams?: URLSearchParams;
  body?: any;
}): Promise<any> {
  const { path, request, fetch, method, queryParams, body } = options;
  
  // Build the URL
  const wpApiPath = path.replace('/api', FUNERAL_API_PATH);
  let url = wpApiPath;
  
  // Add query parameters if provided
  if (queryParams && queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  // Create a mock RequestEvent with the necessary properties
  const mockEvent = {
    request,
    fetch
  } as any;
  
  // Build the request options
  const requestOptions: RequestInit = {
    method: method || request.method,
  };
  
  // Add body if provided or if the original request has a body
  if (body) {
    requestOptions.body = JSON.stringify(body);
  } else if (['POST', 'PUT', 'PATCH'].includes(requestOptions.method || '') && !['GET', 'HEAD'].includes(request.method)) {
    // Only try to get the body if the method supports it
    try {
      const requestBody = await request.clone().json();
      requestOptions.body = JSON.stringify(requestBody);
    } catch (error) {
      // Ignore errors, the body might be empty or not JSON
    }
  }
  
  // Forward the request to WordPress
  return forwardRequestToWordPress(mockEvent, url, requestOptions);
}

/**
 * Handle API errors and return a standardized error response
 *
 * @param err Error object
 * @returns SvelteKit error response
 */
export function handleApiError(err: any) {
  console.error('API Error:', err);
  
  // Create a standardized error response
  const errorResponse = createErrorResponse(
    err.code || 'API_ERROR',
    err.message || 'An unknown error occurred',
    err.status || 500
  );
  
  // Return a JSON response with the error
  return new Response(
    JSON.stringify(errorResponse),
    {
      status: errorResponse.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}