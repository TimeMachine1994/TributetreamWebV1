import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

export const GET: RequestHandler = async ({ params, fetch }) => {
    try {
        const { id } = params;
        const response = await fetch(`${WP_API_BASE}/tributes/${id}`);

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
        }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ params, request, fetch }) => {
    try {
        const { id } = params;
        const data = await request.json();

        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'PUT',
            headers: {
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
        }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, fetch }) => {
    try {
        const { id } = params;
        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'DELETE'
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
        }, { status: 500 });
    }
};
