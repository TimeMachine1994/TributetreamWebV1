/*****************************************************************************************
 * +page.server.ts (Svelte 5 / Dashboard)
 *
 * Handles server-side data fetching for the Dashboard page in SvelteKit.
 * Since the `jwt` cookie is set with `httpOnly`, we must retrieve it on the server,
 * validate it, and optionally pass relevant data to the client.
 *****************************************************************************************/

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_WORDPRESS_API } from '$env/static/private'; // adjust if needed

/**
 * Data structure describing a single Tribute record.
 * Adjust these fields according to your actual data schema from WP.
 */
export interface Tribute {
  id: number;
  title: string;
  content: string;
  // ... other fields as needed
}

/**
 * load function
 * - Retrieves the `jwt` cookie and uses it for server-side requests.
 * - Passes the relevant data to the client.
 */
export const load: PageServerLoad = async ({ cookies }) => {
  console.log('[dashboard/+page.server.ts] load() invoked');

  /***************************************************************
   * 1. Retrieve the JWT Token from httpOnly cookie
   ***************************************************************/
  const token = cookies.get('jwt'); // This will fetch the `httpOnly` cookie server-side
  console.log('[dashboard/+page.server.ts] Checking cookie "jwt":', token);

  // If no token, redirect user to /login
  if (!token) {
    console.warn('[dashboard/+page.server.ts] No JWT found, redirecting to /login');
    throw redirect(307, '/login');
  }

  /***************************************************************
   * 2. Attempt to fetch tributes from WordPress using the token
   ***************************************************************/
  try {
    console.log('[dashboard/+page.server.ts] Attempting to fetch tributes');
    const response = await fetch(`${BASE_WORDPRESS_API}/custom/v1/wpa2_tributes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Pass JWT as Bearer token in Authorization header
        'Content-Type': 'application/json'
      }
    });

    console.log('[dashboard/+page.server.ts] WP fetch response status:', response.status);

    if (!response.ok) {
      console.error('[dashboard/+page.server.ts] Non-OK response from WP:', response.statusText);
      return {
        tributes: '[]',
        status: 'error'
      };
    }

    const data = await response.json();
    console.log('[dashboard/+page.server.ts] Fetched tributes data:', data);

    // Return tributes and status to the client
    return {
      tributes: JSON.stringify(data),
      status: 'success'
    };
  } catch (error) {
    console.error('[dashboard/+page.server.ts] Error fetching tributes:', error);
    // Return empty array and error status in case of failure
    return {
      tributes: '[]',
      status: 'error'
    };
  }
};
