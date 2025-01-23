import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    // First check if user is logged in
    if (!locals.jwt) {
        throw redirect(303, '/login');
    }

    // Check if this is an admin session
    const session = cookies.get('session');
    if (session === 'admin-session') {
        throw redirect(302, '/admin-dashboard');
    }

    return {};
};
