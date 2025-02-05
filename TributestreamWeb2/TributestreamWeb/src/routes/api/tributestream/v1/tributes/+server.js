import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ url }) {
    // Get pagination parameters
    const page = url.searchParams.get('page') || 1;
    const perPage = url.searchParams.get('per_page') || 10;
    const search = url.searchParams.get('search') || '';

    // Construct the WordPress API URL with query parameters
    const wpUrl = new URL(getWpApiUrl('tributes'));
    wpUrl.searchParams.set('page', page);
    wpUrl.searchParams.set('per_page', perPage);
    if (search) {
        wpUrl.searchParams.set('search', search);
    }

    try {
        const res = await fetch(wpUrl);
        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tributes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request }) {
    try {
        const payload = await request.json();

        const res = await fetch(getWpApiUrl('tributes'), {
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
        return new Response(JSON.stringify({ error: 'Failed to create tribute' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
