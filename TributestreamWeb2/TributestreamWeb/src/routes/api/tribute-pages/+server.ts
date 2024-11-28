// src/routes/api/tribute-pages/+server.ts
import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
    try {
        const response = await fetchWithAuth(
            'https://wp.tributestream.com/wp-json/custom/v1/tribute-pages',
            { method: 'GET' },
            event // Pass the event to access cookies
        );

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return new Response(JSON.stringify({ error: 'Error fetching tributes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
