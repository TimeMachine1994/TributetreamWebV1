import { WP_API_URL } from '$lib/utils/env';

/**
 * WordPress API utilities
 */

/**
 * Base URL for the WordPress API
 */
export const WP_API_BASE = `${WP_API_URL}/tributestream/v1`;

/**
 * Create headers for WordPress API requests
 * @param token JWT token
 * @returns Headers object
 */
export function createWpHeaders(token?: string): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

/**
 * Handle WordPress API response
 * @param response Fetch response
 * @returns Promise resolving to response data
 */
export async function handleWpResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }
  
  return data;
}

/**
 * Format error response
 * @param error Error object
 * @param defaultMessage Default error message
 * @returns Error response object
 */
export function formatErrorResponse(error: unknown, defaultMessage: string) {
  console.error('API error:', error);
  
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
    status: 500
  };
}