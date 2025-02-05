import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function POST({ request }) {
    try {
        const payload = await request.json();

        const res = await fetch(getWpApiUrl('register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to register user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
