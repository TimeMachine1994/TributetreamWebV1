import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    // First check if user is logged in
    if (!locals.jwt) {
        throw redirect(303, '/login');
    }

    // Get user data from cookie
    const userCookie = cookies.get('user');
    if (!userCookie) {
        throw redirect(303, '/login');
    }

    try {
        const userData = JSON.parse(userCookie);
        // If user is admin, redirect them to admin page
        if (userData.isAdmin) {
            throw redirect(303, '/admin');
        }
    } catch (error) {
        console.error('Error parsing user cookie:', error);
        throw redirect(303, '/login');
    }

    return {};
};
