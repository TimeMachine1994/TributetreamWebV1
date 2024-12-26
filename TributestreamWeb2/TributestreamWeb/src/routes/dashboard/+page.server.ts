/*****************************************************************************************
 * +page.server.ts
 *
 * This file handles server-side data fetching for the Dashboard page in Svelte 5.
 * It checks if a JWT token is present in cookies; if not, it redirects to /login.
 * Otherwise, it fetches the tributes list from the WordPress backend and returns
 * a JSON string of tributes and a status indicating success or error.
 *****************************************************************************************/

import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import { BASE_WORDPRESS_API } from '$env/static/private';
/**
 * Environment variable pointing to our WordPress API base URL.
 * In a real SvelteKit setup, you might use import { PUBLIC_BASE_WORDPRESS_API } from '$env/static/public';
 * Instead of direct process.env usage. Shown here for illustration.
 */
 
/**
 * Data structure describing a single Tribute record.
 * Adjust these fields according to your actual data schema from WP.
 */
export interface Tribute {
  id: number;
  loved_one_name: string;
  phone_number: string;
  created_at: string;
  custom_html?: string;
}

/**
 * SvelteKit load function to retrieve data from the WordPress backend.
 *
 * @param event - RequestEvent from SvelteKit
 * @returns An object containing `tributes` (as a JSON string) and a `status`.
 *          Or throws a redirect to /login if no JWT token is found in cookies.
 */
export async function load(event: RequestEvent) {
  /********************************************************************
   * 1. Check for JWT Token in cookies
   *    - We assume your JWT is stored under a cookie named 'token'
   *      or any relevant key you’ve chosen.
   * 2. If no token is found, redirect to the login page with 307 status.
   ********************************************************************/
  const token = event.cookies.get('token');
  if (!token) {
    throw redirect(307, '/login');
  }

  try {
    /********************************************************************
     * 3. Make an authenticated fetch call to retrieve tributes from WP
     *    - fetchWithAuth will handle the token-based authentication for us.
     *    - Adjust the endpoint path as needed for your custom WP routes.
     ********************************************************************/
    const response = await fetchWithAuth(
      `${BASE_WORDPRESS_API}/wp-json/custom/v1/wpa2_tributes`,
      { method: 'GET' },
      event
    );

    // Attempt to parse the JSON response from WP
    const data = await response.json();

    // Return tributes (as a JSON string) and a success status
    return {
      tributes: JSON.stringify(data),
      status: 'success'
    };

  } catch (error) {
    console.error('Error fetching wpa2_tributes:', error);
    // In case of error, return an empty array and set status to 'error'
    return {
      tributes: '[]',
      status: 'error'
    };
  }
}
