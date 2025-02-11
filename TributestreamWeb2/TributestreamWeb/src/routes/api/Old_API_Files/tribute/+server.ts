import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_API_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1/tributes';

export const PUT: RequestHandler = async ({ fetch, request, locals, params }) => {
    try {
        const id = request.url.split('/').pop();
        if (!id) {
            throw error(400, { message: 'Tribute ID is required' });
        }

        const updates = await request.json();
        console.log('[PUT /tributestream/v1/tribute] Updating tribute:', id, updates);

        const response = await fetch(`${WP_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        console.log('[PUT /tributestream/v1/tribute] Response status:', response.status);

        if (!response.ok) {
            console.error('[PUT /tributestream/v1/tribute] WordPress API error:', response.statusText);
            throw error(response.status, {
                message: `WordPress API error: ${response.statusText}`
            });
        }

        const data = await response.json();
        console.log('[PUT /tributestream/v1/tribute] Update successful:', data);

        return json(data);
    } catch (err) {
        console.error('[PUT /tributestream/v1/tribute] Error:', err);
        throw error(500, {
            message: 'Failed to update tribute'
        });
    }
};

export const GET: RequestHandler = async ({ fetch, request, locals, url }) => {
    try {
        // Forward query parameters
        const queryParams = new URLSearchParams();
        for (const [key, value] of url.searchParams) {
            queryParams.append(key, value);
        }

        // Add default pagination if not provided
        if (!url.searchParams.has('page')) {
            queryParams.append('page', '1');
        }
        if (!url.searchParams.has('per_page')) {
            queryParams.append('per_page', '10');
        }

        const apiUrl = `${WP_API_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        console.log('[/tributestream/v1/tribute] Fetching from:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Accept': 'application/json',
                'Origin': url.origin
            }
        });

        console.log('[/tributestream/v1/tribute] Response status:', response.status);

        if (!response.ok) {
            console.error('[/tributestream/v1/tribute] WordPress API error:', response.statusText);
            throw error(response.status, {
                message: `WordPress API error: ${response.statusText}`
            });
        }

        const data = await response.json();
        console.log('[/tributestream/v1/tribute] Data received:', data);
        
        return json(data, {
            headers: {
                'Access-Control-Allow-Origin': url.origin,
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Authorization, Content-Type'
            }
        });
    } catch (err) {
        console.error('[/tributestream/v1/tribute] Error:', err);
        throw error(500, {
            message: 'Failed to fetch tributes from WordPress'
        });
    }
};
