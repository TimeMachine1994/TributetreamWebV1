/*****************************************************************************************
 * +page.server.ts
 * 
 * This file handles server-side data fetching for the Dashboard page in Svelte 5. 
 * It returns a JSON string of tributes and a status indicating success or error.
 *****************************************************************************************/

import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Environment variable pointing to our WordPress API base URL
 */
const BASE_WORDPRESS_API = process.env.BASE_WORDPRESS_API;

/**
 * Data structure describing a single Tribute record.
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
 */
export async function load(event: RequestEvent) {
    try {
        const response = await fetchWithAuth(
            `${BASE_WORDPRESS_API}/wp-json/wp/v2/wpa2_tributes`,
            { method: 'GET' },
            event
        );
        const data = await response.json();

        return {
            tributes: JSON.stringify(data),
            status: 'success'
        };
    } catch (error) {
        console.error('Error fetching wpa2_tributes:', error);
        return { 
            tributes: '[]',
            status: 'error'
        };
    }
}
