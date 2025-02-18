import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_AUTH_URL = 'http://localhost:80/wp-json/jwt-auth/v1/token';

export const POST: RequestHandler = async ({ fetch, request }) => {
    try {
        const body = await request.json();
        
        const response = await fetch(WP_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: body.username,
                password: body.password
            })
        });

        if (!response.ok) {
            throw error(response.status, {
                message: 'Authentication failed'
            });
        }

        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error('[/api/auth] Error:', err);
        throw error(500, {
            message: 'Failed to authenticate with WordPress'
        });
    }
};
