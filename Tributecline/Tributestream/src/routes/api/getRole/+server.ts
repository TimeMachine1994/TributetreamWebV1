import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_ROLE_URL = 'http://localhost:80/wp-json/tributestream/v1/getRole';

export const GET: RequestHandler = async ({ url }) => {
    // 1) Get the userId from query params
    const userId = url.searchParams.get('id');
    if (!userId) {
        return json(
            { error: 'User ID is required' },
            { status: 400 }
        );
    }

    // 2) Construct the URL
    const wpUrl = `${WP_ROLE_URL}?id=${userId}`;

    try {
        // 3) Fetch from WordPress endpoint
        const res = await fetch(wpUrl);

        if (!res.ok) {
            return json(
                { error: 'Failed to fetch user role from WordPress' },
                { status: res.status }
            );
        }

        // 4) Parse and validate the response
        const data = await res.json();
        
        // Ensure we have a valid role
        if (!data.role) {
            return json(
                { error: 'No role returned from WordPress' },
                { status: 500 }
            );
        }

        // Convert single role to array format
        const roles = Array.isArray(data.role) ? data.role : [data.role];

        // 5) Return standardized response
        return json({
            success: true,
            roles,
            // Include primary role for backwards compatibility
            role: roles[0]
        });
    } catch (error) {
        console.error('Error fetching user role:', error);
        return json(
            { error: 'Failed to fetch user role' },
            { status: 500 }
        );
    }
};
