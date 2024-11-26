import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';

export async function load(event: RequestEvent) {
    try {
        const response = await fetchWithAuth(
            '/wp-json/custom/v1/tribute-pages',
            { method: 'GET' },
            event.request // Pass the request object for cookies
        );
        const tributes = await response.json();
        return {
            tributes, // Pass the data to the page as props
        };
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return {
            tributes: [], // Return an empty array on failure
        };
    }
}
