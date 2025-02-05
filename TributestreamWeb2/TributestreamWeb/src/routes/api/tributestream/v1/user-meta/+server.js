import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function POST({ request, cookies }) {
    try {
        const payload = await request.json();
        
        // Get JWT token from cookies if available
        const jwt = cookies.get('jwt_token');
        
        const res = await fetch(getWpApiUrl('user-meta'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(jwt && { 'Authorization': `Bearer ${jwt}` })
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update user meta' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
