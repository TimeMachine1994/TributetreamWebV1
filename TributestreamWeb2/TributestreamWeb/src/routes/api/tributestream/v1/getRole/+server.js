import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ url }) {
    const userId = url.searchParams.get('id');
    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const wpUrl = `${getWpApiUrl('getRole')}?id=${userId}`;

    try {
        const res = await fetch(wpUrl);
        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch user role' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
