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
 * - Passes the relevant data to the client.export const load: PageServerLoad = async ({ cookies }) => {
   console.log('[load] Checking for existing JWT cookie...');
   const token = cookies.get('jwt');
 
   if (token) {
     console.log('[load] JWT cookie found. Redirecting to /dashboard.');
     throw redirect(302, '/dashboard');
   }
 
   console.log('[load] No JWT cookie found. Returning user: null.');
   return { user: null };
 };
 
 */export const load: PageServerLoad = async ({ cookies }) => {
   console.log('[load] Checking for existing JWT cookie...');
   const token = cookies.get('jwt');
 
   if (token) {
     console.log('[load] JWT cookie found. Redirecting to /dashboard.');
     throw redirect(302, '/dashboard');
   }
 
   console.log('[load] No JWT cookie found. Returning user: null.');
   return { user: null };
 };
 