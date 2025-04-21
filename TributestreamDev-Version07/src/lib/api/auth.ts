import { STRAPI_URL } from '../config';
import type { UserInfo } from '../types/auth.types';
import { STRAPI_PUBLIC_API } from '$env/static/private';
import { STRAPI_PRIVATE_API } from '$env/static/private';
/**
 * Fetch user data using the JWT stored in cookies
 * @param fetch - SvelteKit fetch function that passes cookies automatically
 * @returns The user data or null if not authenticated
 */
export async function fetchUserData(fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>): Promise<UserInfo | null> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization: bearer': STRAPI_PUBLIC_API,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}