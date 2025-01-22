import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.authenticated || !locals.token || !locals.userId) {
        throw error(401, 'Unauthorized');
    }

    try {
        const metaResponse = await fetch('/api/user-meta', {
            headers: {
                'Authorization': `Bearer ${locals.token}`
            }
        });

        if (!metaResponse.ok) {
            throw error(metaResponse.status, 'Failed to fetch user metadata');
        }

        const meta = await metaResponse.json();

        return {
            meta,
            userId: locals.userId,
            token: locals.token
        };
    } catch (err) {
        console.error('Error loading user metadata:', err);
        throw error(500, 'Failed to load user data');
    }
};
