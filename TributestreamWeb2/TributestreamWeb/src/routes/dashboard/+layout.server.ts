import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    // Validate JWT token
    try {
        const response = await fetch('/api/auth/validate', {
            headers: {
                'Authorization': `Bearer ${locals.token}`
            }
        });

        if (!response.ok) {
            throw redirect(302, '/login');
        }

        return {
            user: locals.user
        };
    } catch (error) {
        console.error('Error validating token:', error);
        throw redirect(302, '/login');
    }
};
