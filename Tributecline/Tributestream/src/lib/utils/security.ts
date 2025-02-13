/**
 * Security utilities for handling authentication and token validation
 */
import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_WORDPRESS_URL } from '$env/static/public';

/**
 * Validates a JWT token by making a request to WordPress
 * @param token The JWT token to validate
 * @param event The RequestEvent object containing fetch function
 * @returns Promise<boolean> True if token is valid, false otherwise
 */
export async function validateToken(token: string, event?: RequestEvent): Promise<boolean> {
  if (!token) return false;
  
  try {
    // Ensure we have the WordPress URL
    if (!PUBLIC_WORDPRESS_URL) {
      console.error('PUBLIC_WORDPRESS_URL environment variable is not set');
      return false;
    }

    // Use event.fetch if available (server-side), otherwise use global fetch (client-side)
    const fetchFn = event?.fetch || fetch;
    
    const response = await fetchFn(`${PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Token validation failed with status:', response.status);
      return false;
    }

    const data = await response.json();
    return data.code === 'jwt_auth_valid_token' && data.data.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Sets secure authentication cookie
 * @param token The JWT token to store
 * @param cookies The cookies object from SvelteKit
 */
export function setAuthCookie(token: string, cookies: any) {
  cookies.set('auth_token', token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Type guard to check if an error is an instance of Error
 * @param error The error to check
 * @returns boolean indicating if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Formats an error message for display
 * @param error The error to format
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}