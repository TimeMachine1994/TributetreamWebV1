import { redirect } from '@sveltejs/kit';
import { apiFetch, validateToken } from '$lib/utils/api';

export async function load() {
    const isAuthenticated = await validateToken();
    if (!isAuthenticated) {
        throw redirect(302, '/login');
    }

    const events = await apiFetch(`/tributestream/v1/tribute/events`);
    return { events };
}
