import type { PageServerLoad } from './$types';
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    console.log('Starting dashboard data load');

    // Check for JWT token in cookies
    const jwt = event.cookies.get('jwt');
    if (!jwt) {
        console.log('No JWT token found');
        throw error(401, 'Not authenticated');
    }

    const API_BASE = 'https://wp.tributestream.com/wp-json/custom/v1';

    try {
        console.log('Fetching tributes and streams...');
        const [tributesRes, streamsRes] = await Promise.all([
            fetchWithAuth(`${API_BASE}/wpa2_tributes`, { method: 'GET' }, event),
            fetchWithAuth(`${API_BASE}/streams`, { method: 'GET' }, event)
        ]);

        if (!tributesRes.ok || !streamsRes.ok) {
            throw new Error('API response not ok');
        }

        const tributes = await tributesRes.json();
        const streams = await streamsRes.json();

        console.log('Fetched tributes count:', tributes.length);
        console.log('Fetched streams count:', streams.length);

        return {
            tributes,
            streams
        };
    } catch (err) {
        console.error('Load error:', err);
        throw error(500, {
            message: 'Failed to load dashboard data',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
