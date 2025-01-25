import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

export const GET: RequestHandler = async ({ request, fetch }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return json({ valid: false, error: 'Invalid authorization header' }, { status: 401 });
        }

        const token = authHeader.slice(7);
        const response = await fetch(`${WP_API_BASE}/jwt-auth/v1/token/validate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ 
                valid: false, 
                error: error.message || 'Token validation failed' 
            }, { status: 401 });
        }

        return json({ valid: true });
    } catch (error) {
        console.error('Error validating token:', error);
        return json({ 
            valid: false, 
            error: error instanceof Error ? error.message : 'Token validation failed' 
        }, { status: 500 });
    }
};
