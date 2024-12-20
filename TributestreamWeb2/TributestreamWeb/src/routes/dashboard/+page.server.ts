import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
    try {
        const response = await fetchWithAuth(
            'http://localhost/wp-json/wp/v2/wpa2_tributes',
            { method: 'GET' },
            event
        );
        const tributes = await response.json();
        return { 
            tributes,
            status: 'success'
        };
    } catch (error) {
        console.error('Error fetching wpa2_tributes:', error);
        return { 
            tributes: [],
            status: 'error'
        };
    }
}