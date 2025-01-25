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

export const GET: RequestHandler = async ({ url, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const page = url.searchParams.get('page') || '1';
        const perPage = url.searchParams.get('per_page') || '10';
        const search = url.searchParams.get('search') || '';

        const wpApiUrl = new URL(`${WP_API_BASE}/tributes`);
        wpApiUrl.searchParams.set('page', page);
        wpApiUrl.searchParams.set('per_page', perPage);
        wpApiUrl.searchParams.set('orderby', 'date');
        wpApiUrl.searchParams.set('order', 'desc');
        if (search) {
            wpApiUrl.searchParams.set('search', search);
        }

        const response = await fetch(wpApiUrl, {
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tributes from WordPress');
        }

        const data = await response.json();
        return json({
            tributes: data.tributes || [],
            total_pages: data.total_pages || 1
        });
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return json({
            tributes: [],
            total_pages: 1,
            error: error instanceof Error ? error.message : 'Failed to fetch tributes'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const POST: RequestHandler = async ({ request, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const tribute = await request.json();

        const response = await fetch(`${WP_API_BASE}/tributes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tribute)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create tribute');
        }

        const data = await response.json();
        return json({
            tribute: data,
            success: true
        });
    } catch (error) {
        console.error('Error creating tribute:', error);
        return json({
            tribute: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const PUT: RequestHandler = async ({ request, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id, ...data } = await request.json();
        
        if (!id) {
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

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
            tribute: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id } = await request.json();
        
        if (!id) {
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

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
