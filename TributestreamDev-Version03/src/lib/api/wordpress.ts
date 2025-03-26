import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Configure WordPress API URL
const WORDPRESS_API_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json';

/**
 * Custom API error interface
 */
export interface ApiErrorData {
  message?: string;
  code?: string;
  status?: number;
}

/**
 * Makes an authenticated request to the WordPress REST API
 */
export async function wordpressRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token?: string,
  body?: any
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as ApiErrorData;
      const errorMessage = errorData.message || 'An error occurred while communicating with the API';
      throw error(response.status, errorMessage);
    }

    return response.json();
  } catch (err: unknown) {
    // Check if this is already a SvelteKit error
    if (typeof err === 'object' && err !== null && 'status' in err && 'body' in err) {
      throw err;
    }
    
    console.error('WordPress API Error:', err);
    
    // Default error
    throw error(500, 'An unexpected error occurred');
  }
}

/**
 * Helper function to extract JWT token from cookies
 */
export function getAuthToken(event: RequestEvent): string | undefined {
  return event.cookies.get('jwt');
}