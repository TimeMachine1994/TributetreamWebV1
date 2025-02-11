import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

const validateJWT = (jwt: string | undefined) => {
    if (!jwt) {
        throw new Error('No JWT provided');
    }
    // In production, you would validate the JWT here
    return true;
};

export const GET: RequestHandler = async ({ params, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id } = params;
        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            headers: {
                'Authorization': `Bearer ${locals.jwt}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tribute');
        }

        const tribute = await response.json();
        return json(tribute);
    } catch (error) {
        console.error('Error fetching tribute:', error);
        return json({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const PUT: RequestHandler = async ({ params, request, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id } = params;
        const data = await request.json();

        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update tribute');
        }

        const updatedTribute = await response.json();
        return json({
            tribute: updatedTribute,
            success: true
        });
    } catch (error) {
        console.error('Error updating tribute:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id } = params;
        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete tribute');
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting tribute:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};
