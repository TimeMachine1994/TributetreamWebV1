// ==============================
// Server-Side Authentication Check
// ==============================

import { redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/utils/api';

export async function load() {
    const isAuthenticated = await validateToken();
    if (!isAuthenticated) {
        throw redirect(302, '/login');
    }

    // Fetch tributes if authenticated
    const tributes = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then((res) => res.json());

    return { tributes };
}
