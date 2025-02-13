import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_URL = 'https://wp.tributestream.com';

export const GET: RequestHandler = async ({ request, fetch }) => {
    try {
        // Get the authorization header from the incoming request
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader) {
            return json({ error: 'No authorization token provided' }, { status: 401 });
        }

        // Make request to WordPress API
        const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return json(errorData, { status: response.status });
        }

        // Get the user data and return it
        const userData = await response.json();
        return json(userData);

    } catch (error) {
        console.error('Error fetching user data:', error);
        return json({ 
            error: 'Failed to fetch user data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};