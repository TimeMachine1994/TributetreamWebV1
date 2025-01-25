 nimport { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // Clear the auth token cookie
        cookies.delete('auth_token', { path: '/' });

        return json({ success: true });
    } catch (error) {
        console.error('Error during logout:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Logout failed' 
        }, { status: 500 });
    }
};
