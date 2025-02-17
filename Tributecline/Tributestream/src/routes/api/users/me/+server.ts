import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_URL = 'http://localhost:80/wp-json';

export const GET: RequestHandler = async ({ request, fetch }) => {
    console.log('[GET] Incoming request received.');

    try {
        // Get the authorization header from the incoming request
        const authHeader = request.headers.get('Authorization');
        console.log('[GET] Authorization header:', authHeader);

        if (!authHeader) {
            console.log('[GET] No authorization header provided.');
            return json({ error: 'No authorization token provided' }, { status: 401 });
        }

        // Make request to WordPress API
        const wordpressEndpoint = `${WORDPRESS_URL}/wp/v2/users/me`;
        console.log('[GET] Making request to WordPress API at:', wordpressEndpoint);

        const response = await fetch(wordpressEndpoint, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        console.log('[GET] Received response from WordPress API with status:', response.status);

        if (!response.ok) {
            console.log('[GET] WordPress API response not OK. Attempting to parse error response.');
            const errorData = await response.json();
            console.log('[GET] Error data from WordPress API:', errorData);
            return json(errorData, { status: response.status });
        }

        // Get the user data and return it
        const userData = await response.json();
        console.log('[GET] Successfully fetched user data:', userData);
        return json(userData);

    } catch (error) {
        console.error('[GET] Error fetching user data:', error);
        return json({ 
            error: 'Failed to fetch user data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
