import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Ensures the request is authenticated
 * @param event The request event
 * @returns The JWT token
 * @throws {Error} If the request is not authenticated
 */
export function ensureAuthenticated(event: RequestEvent): string {
  const token = event.cookies.get('jwt');
  
  if (!token) {
    throw error(401, 'Authentication required');
  }
  
  return token;
}

/**
 * Checks if the request is authenticated
 * @param event The request event
 * @returns Whether the request is authenticated
 */
export function isAuthenticated(event: RequestEvent): boolean {
  return !!event.cookies.get('jwt');
}