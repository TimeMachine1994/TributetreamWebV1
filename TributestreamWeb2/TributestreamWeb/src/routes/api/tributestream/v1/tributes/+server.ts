import { json } from '@sveltejs/kit';
import { getWpApiUrl } from '$lib/config';

export async function GET({ url }) {
    // Get pagination parameters with proper type coercion
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = Number(url.searchParams.get('per_page')) || 10;
    const search = url.searchParams.get('search') || '';

    // Construct the WordPress API URL with query parameters
    const wpUrl = new URL(getWpApiUrl('tributes'));
    wpUrl.searchParams.set('page', String(page));
    wpUrl.searchParams.set('per_page', String(perPage));
    if (search) {
        wpUrl.searchParams.set('search', search);
    }

    try {
        console.log('[tributes/GET] Fetching from WordPress URL:', wpUrl.toString());
        
        const res = await fetch(wpUrl);
        console.log('[tributes/GET] Response status:', res.status);
        console.log('[tributes/GET] Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[tributes/GET] Error response:', errorText);
            return new Response(errorText, { status: res.status });
        }

        const data = await res.json();
        console.log('[tributes/GET] WordPress response:', data);

        // WordPress plugin returns { tributes, total_pages, total_items, current_page }
        // If we get an array directly, wrap it in our standard format
        const response = Array.isArray(data) ? {
            tributes: data,
            total_pages: Number(res.headers.get('X-WP-TotalPages')) || 1,
            total_items: Number(res.headers.get('X-WP-Total')) || data.length,
            current_page: page
        } : {
            tributes: data.tributes || [],
            totalPages: data.total_pages || 1,
            totalItems: data.total_items || 0,
            currentPage: data.current_page || page
        };

        console.log('[tributes/GET] Final response:', response);
        return json(response);
    } catch (error: unknown) {
        console.error('[tributes/GET] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch tributes',
            details: errorMessage
        }), {
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
        return json(data); // For POST, just return the created tribute data
    } catch (error: unknown) {
        console.error('[tributes/POST] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ 
            error: 'Failed to create tribute',
            details: errorMessage
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
