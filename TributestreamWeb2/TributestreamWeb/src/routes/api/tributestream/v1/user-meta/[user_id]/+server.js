import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ params, cookies }) {
    const { user_id } = params;

    // Get JWT token from cookies if available
    const jwt = cookies.get('jwt_token');

    try {
        const res = await fetch(getWpApiUrl(`user-meta/${user_id}`), {
            method: 'GET',
            headers: {
                ...(jwt && { 'Authorization': `Bearer ${jwt}` })
            }
        });

        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch user meta' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
