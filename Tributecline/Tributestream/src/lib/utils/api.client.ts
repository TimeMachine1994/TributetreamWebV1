import { getClientApiUrl, WP_ENDPOINTS, type WPApiError } from '$lib/config/wordpress.client';

/**
 * Client-side WordPress API utilities
 * Provides methods for interacting with the WordPress API from the browser
 */

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * API response error type for client-side error handling
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make a client-side request to the WordPress API
 * @param endpoint - The API endpoint path
 * @param options - Request options including headers and method
 * @returns Promise with the parsed response
 * @throws ApiError on API errors
 */
async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = getClientApiUrl(endpoint);
  const headers = new Headers(options.headers);

  // Set default headers
  headers.set('Content-Type', 'application/json');
  
  // Add authorization if token is provided
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Allow credentials for cross-origin requests
      mode: 'cors'  // Explicitly enable CORS
    });

    // Handle CORS and network errors
    if (!response.ok) {
      // Special handling for CORS errors which typically return status 0
      if (response.status === 0) {
        throw new ApiError(
          'cors_error',
          'Unable to access the API. Please check CORS configuration.',
          0
        );
      }

      // Handle JWT auth specific errors
      if (response.status === 403 && response.url.includes('jwt-auth')) {
        throw new ApiError(
          'jwt_auth_error',
          'Authentication failed. Please check your credentials.',
          403
        );
      }

      const data = await response.json().catch(() => ({}));
      const wpError = data as WPApiError;
      throw new ApiError(
        wpError.code || 'unknown_error',
        wpError.message || 'Unknown error occurred',
        wpError.data?.status || response.status,
        wpError.data
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Enhanced error handling for network and CORS issues
    if (error instanceof TypeError) {
      if (error.message.includes('CORS')) {
        throw new ApiError(
          'cors_error',
          'Cross-Origin Request Blocked: ' + error.message,
          0
        );
      }
      if (error.message.includes('NetworkError')) {
        throw new ApiError(
          'network_error',
          'Network request failed. Please check your connection.',
          0
        );
      }
    }

    // Generic error handler
    throw new ApiError(
      'request_failed',
      error instanceof Error ? error.message : 'Request failed',
      500
    );
  }
}

/**
 * Authentication response type
 */
export interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/**
 * Login to WordPress and get a JWT token
 * @param username - WordPress username
 * @param password - WordPress password
 * @returns Promise with the authentication response
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
  return makeRequest<AuthResponse>(WP_ENDPOINTS.AUTH.TOKEN, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

/**
 * Validate the current JWT token
 * @param token - The JWT token to validate
 * @returns Promise<boolean> - True if token is valid
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    await makeRequest(WP_ENDPOINTS.AUTH.VALIDATE, {
      method: 'POST',
      token
    });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return false;
    }
    throw error;
  }
}

/**
 * WordPress user type
 */
export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
  meta: Record<string, unknown>;
}

/**
 * Get the current user's data
 * @param token - Valid JWT token
 * @returns Promise with user data
 */
export async function getCurrentUser(token: string): Promise<WordPressUser> {
  return makeRequest<WordPressUser>(`${WP_ENDPOINTS.API.USERS}/me`, {
    token
  });
}

// Export the base request function for other client-side modules
export { makeRequest };