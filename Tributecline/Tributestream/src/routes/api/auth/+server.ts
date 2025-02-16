import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockAuthenticate } from '$lib/stores/mockData';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({
                success: false,
                error: 'Username and password are required'
            }, { status: 400 });
        }

        const authResult = mockAuthenticate(username, password);

        if (!authResult.success || !authResult.user) {
            return json({
                success: false,
                error: authResult.error || 'Authentication failed'
            }, { status: 401 });
        }

        // Return successful authentication response
        return json({
            success: true,
            user: {
                id: authResult.user.id,
                username: authResult.user.username,
                email: authResult.user.email,
                displayName: authResult.user.displayName,
                roles: authResult.user.roles,
                meta: authResult.user.meta,
                token: authResult.user.token
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        return json({
            success: false,
            error: 'An unexpected error occurred'
        }, { status: 500 });
    }
};
