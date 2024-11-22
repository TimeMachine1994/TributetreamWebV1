// ==============================
// Client-Side Redirect on Login
// ==============================

import { redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/utils/api';

export async function load() {
    // Check if the user is already logged in
    const isAuthenticated = await validateToken();
    if (isAuthenticated) {
        // Redirect to admin page if logged in
        throw redirect(302, '/admin');
    }
}
