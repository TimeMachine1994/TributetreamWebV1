import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
    try {
        const response = await fetchWithAuth(
            'https://wp.tributestream.com/wp-json/custom/v1/tribute-pages',
            { method: 'GET' },
            event.request
        );
        const tributes = await response.json();
        return { tributes }; // Ensure this matches the prop in +page.svelte
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return { tributes: [] }; // Default to an empty array on error
    }
}
