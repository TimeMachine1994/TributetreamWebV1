// ==============================
// Server-Side Tribute Fetching
// ==============================

import { redirect } from '@sveltejs/kit';
import { apiFetch, validateToken } from '$lib/utils/api';

export async function load({ params }) {
    const isAuthenticated = await validateToken();
    if (!isAuthenticated) {
        throw redirect(302, '/login');
    }

    const tribute = await apiFetch(`/tributestream/v1/tribute/${params.id}`);
    if (!tribute) {
        throw redirect(404, '/not-found');
    }

    return { tribute };
}
