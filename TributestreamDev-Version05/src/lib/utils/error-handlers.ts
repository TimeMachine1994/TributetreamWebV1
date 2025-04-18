/**
 * Error handling utilities for API requests
 */

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Authentication error class
 */
export class AuthError extends ApiError {
  constructor(message: string = 'Authentication failed', status: number = 401, data?: any) {
    super(message, status, data);
    this.name = 'AuthError';
  }
}

/**
 * Network error class
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error', status: number = 0, data?: any) {
    super(message, status, data);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', status: number = 400, data?: any) {
    super(message, status, data);
    this.name = 'ValidationError';
  }
}

/**
 * Parse error response from the API
 * @param response Fetch Response object
 * @returns Promise resolving to the parsed error
 */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    
    // Handle WordPress REST API error format
    if (data.code && data.message) {
      return new ApiError(data.message, response.status, data);
    }
    
    // Handle JWT Auth plugin error format
    if (Array.isArray(data) && data[0]?.code && data[0]?.message) {
      return new ApiError(data[0].message, response.status, data[0]);
    }
    
    // Generic error with data
    return new ApiError(data.message || 'Unknown error', response.status, data);
  } catch (e) {
    // If we can't parse the JSON, just return a generic error
    return new ApiError(`HTTP Error: ${response.status} ${response.statusText}`, response.status);
  }
}

/**
 * Handle fetch errors
 * @param error The caught error
 * @returns ApiError instance
 */
export function handleFetchError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network error: Unable to connect to the server');
  }
  
  return new ApiError(error.message || 'Unknown error');
}