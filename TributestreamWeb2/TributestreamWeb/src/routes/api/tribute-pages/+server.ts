// src/routes/api/tribute-pages/+server.ts
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
    console.log('[GET /api/tribute-pages] Request received. Event:', event);

    try {
        console.log('[GET /api/tribute-pages] Fetching tributes from WordPress API...');
        const response = await fetchWithAuth(
            'https://wp.tributestream.com/wp-json/tributestream/v1/tribute',
            { method: 'GET' },
            event // Pass the event to access cookies
        );

        console.log('[GET /api/tribute-pages] Response received from WordPress API. Status:', response.status);
        const data = await response.json();
        console.log('[GET /api/tribute-pages] Parsed JSON data:', data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[GET /api/tribute-pages] Error fetching tributes:', error);
        return new Response(JSON.stringify({ error: 'Error fetching tributes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
