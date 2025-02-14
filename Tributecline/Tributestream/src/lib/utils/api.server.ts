import { getServerApiUrl, WP_ENDPOINTS, WordPressApiError, type WPApiError } from '$lib/config/wordpress.server';

/**
 * Server-side WordPress API utilities
 * Provides secure methods for interacting with the WordPress API
 */

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Make a server-side request to the WordPress API
 * @param endpoint - The API endpoint path
 * @param options - Request options including headers and method
 * @returns Promise with the parsed response
 * @throws WordPressApiError on API errors
 */
async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = getServerApiUrl(endpoint);
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
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      const wpError = data as WPApiError;
      throw new WordPressApiError(
        wpError.code || 'unknown_error',
        wpError.message || 'Unknown error occurred',
        wpError.data?.status || response.status
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof WordPressApiError) {
      throw error;
    }

    // Handle network or parsing errors
    throw new WordPressApiError(
      'network_error',
      error instanceof Error ? error.message : 'Network request failed',
      500
    );
  }
}

/**
 * Validate a JWT token against the WordPress API
 * @param token - The JWT token to validate
 * @returns Promise<boolean> - True if token is valid
 * @throws WordPressApiError on validation failure
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    await makeRequest(WP_ENDPOINTS.AUTH.VALIDATE, {
      method: 'POST',
      token
    });
    return true;
  } catch (error) {
    if (error instanceof WordPressApiError && error.status === 403) {
      return false;
    }
    throw error;
  }
}

/**
 * Authenticate with WordPress and get a JWT token
 * @param username - WordPress username
 * @param password - WordPress password
 * @returns Promise with the authentication response
 */
interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export async function authenticate(username: string, password: string): Promise<AuthResponse> {
  return makeRequest<AuthResponse>(WP_ENDPOINTS.AUTH.TOKEN, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

/**
 * Get current user data from WordPress
 * @param token - Valid JWT token
 * @returns Promise with user data
 */
interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
  meta: Record<string, unknown>;
}

export async function getCurrentUser(token: string): Promise<WordPressUser> {
  return makeRequest<WordPressUser>(`${WP_ENDPOINTS.API.USERS}/me`, {
    token
  });
}

// Export the base request function for other server-side modules
export { makeRequest };