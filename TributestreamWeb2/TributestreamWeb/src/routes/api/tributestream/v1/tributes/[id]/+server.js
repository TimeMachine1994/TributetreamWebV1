import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ params }) {
    const { id } = params;
    const wpUrl = getWpApiUrl(`tributes/${id}`);

    try {
        const res = await fetch(wpUrl);
        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tribute' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT({ params, request }) {
    const { id } = params;
    try {
        const payload = await request.json();

        const res = await fetch(getWpApiUrl(`tributes/${id}`), {
            method: 'PUT',
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
        return new Response(JSON.stringify({ error: 'Failed to update tribute' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE({ params }) {
    const { id } = params;
    try {
        const res = await fetch(getWpApiUrl(`tributes/${id}`), {
            method: 'DELETE'
        });

        if (!res.ok) {
            return new Response(await res.text(), { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete tribute' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
