import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ params }) {
    const { slug } = params;
    const wpUrl = getWpApiUrl(`tribute/${slug}`);

    try {
        const res = await fetch(wpUrl);
        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tribute by slug' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
