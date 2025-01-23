import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
    console.log('📥 Received GET request for tributes endpoint');
    console.log('🔍 Query params:', Object.fromEntries(url.searchParams));

    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        console.error('🚫 Unauthorized access attempt - user is not admin');
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        console.error('🚫 No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    const tributeId = url.searchParams.get('id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    const search = url.searchParams.get('search') || '';
    const recent = url.searchParams.get('recent') === 'true';

    // If recent is true, return most recent tributes
    if (recent) {
        console.log('🔄 Fetching recent tributes...');
        try {
            const apiUrl = `${WORDPRESS_API_BASE}/tributes?per_page=5&orderby=date&order=desc`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) {
                console.error('❌ Failed to fetch recent tributes:', response.status, response.statusText);
                throw new Error('Failed to fetch recent tributes');
            }
            const tributes = await response.json();
            const total = parseInt(response.headers.get('X-WP-Total') || '0');
            console.log('✅ Successfully fetched recent tributes:', {
                totalCount: total,
                tributesReceived: tributes.length
            });
            return json({ recent: tributes, total });
        } catch (error) {
            console.error('💥 Error fetching recent tributes:', error);
            return json({ error: 'Failed to fetch recent tributes' }, { status: 500 });
        }
    }

    // If ID is provided, fetch single tribute
    if (tributeId) {
        console.log('🔄 Fetching single tribute with ID:', tributeId);
        try {
            const apiUrl = `${WORDPRESS_API_BASE}/tributes/${tributeId}`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, { 
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            
            if (!response.ok) {
                const message = await response.text();
                console.error('❌ Failed to fetch tribute:', {
                    status: response.status,
                    statusText: response.statusText,
                    details: message
                });
                return json({ 
                    error: 'Failed to fetch tribute data', 
                    details: message
                }, { status: response.status });
            }

            const tribute = await response.json();
            console.log('✅ Successfully fetched tribute:', { id: tribute.id });
            return json(tribute, { 
                status: 200,
                headers: {
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate'
                }
            });
        } catch (error: unknown) {
            console.error('Error fetching tribute:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return json({ 
                error: 'An error occurred', 
                details: errorMessage
            }, { status: 500 });
        }
    }

    // Otherwise, fetch paginated list of tributes
    console.log('🔄 Fetching paginated tributes list...');
    try {
        const queryParams = new URLSearchParams({
            per_page: perPage.toString(),
            page: page.toString(),
            search: search
        });

        const apiUrl = `${WORDPRESS_API_BASE}/tributes?${queryParams}`;
        console.log('🌐 Making request to:', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const message = await response.text();
            console.error('❌ Failed to fetch tributes:', {
                status: response.status,
                statusText: response.statusText,
                details: message
            });
            return json({ error: 'Failed to fetch tributes', details: message }, { status: response.status });
        }

        const tributes = await response.json();
        const total = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

        console.log('✅ Successfully fetched tributes:', {
            total,
            totalPages,
            currentPage: page,
            tributesReceived: tributes.length
        });

        return json({
            tributes,
            total,
            totalPages,
            page,
            perPage
        });
    } catch (error: unknown) {
        console.error('Error fetching tributes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ error: 'Failed to fetch tributes', details: errorMessage }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const tributeData = await request.json();
        const response = await fetch(`${WORDPRESS_API_BASE}/tributes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(tributeData)
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ error: error.message }, { status: response.status });
        }

        const newTribute = await response.json();
        return json(newTribute, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating tribute:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ error: 'Failed to create tribute', details: errorMessage }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, cookies, locals }) => {
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const tributeData = await request.json();
        const { id, ...updateData } = tributeData;

        if (!id) {
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        const response = await fetch(`${WORDPRESS_API_BASE}/tributes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ error: error.message }, { status: response.status });
        }

        const updatedTribute = await response.json();
        return json(updatedTribute);
    } catch (error: unknown) {
        console.error('Error updating tribute:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ error: 'Failed to update tribute', details: errorMessage }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, cookies, locals }) => {
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id) {
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        const response = await fetch(`${WORDPRESS_API_BASE}/tributes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ error: error.message }, { status: response.status });
        }

        return json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting tribute:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ error: 'Failed to delete tribute', details: errorMessage }, { status: 500 });
    }
};
