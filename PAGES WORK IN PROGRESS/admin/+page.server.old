// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get('token');
    if (!token) {
        throw redirect(302, '/login');
    }

    const userResponse = await fetch('https://wp.tributestream.com/wp-json/wp/v2/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!userResponse.ok) {
        throw redirect(302, '/login');
    }

    const user = await userResponse.json();
    if (!user.roles.includes('administrator')) {
        throw redirect(302, '/login');
    }

    const slugsResponse = await fetch('https://wp.tributestream.com/wp-json/custom/v1/slugs', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!slugsResponse.ok) {
        throw new Error('Failed to fetch slugs');
    }

    const slugs = await slugsResponse.json();

    return {
        slugs
    };
};
