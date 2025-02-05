import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET() {
    const wpUrl = getWpApiUrl('all-tributes');

    try {
        const res = await fetch(wpUrl);
        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch all tributes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
