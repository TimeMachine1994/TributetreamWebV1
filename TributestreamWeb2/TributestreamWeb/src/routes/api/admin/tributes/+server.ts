import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1/admin';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
    console.log('📥 Received GET request for tributes');
    
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
    const count = url.searchParams.get('count') === 'true';
    const recent = url.searchParams.get('recent') === 'true';

    try {
        // If count is true, return total count
        if (count) {
            console.log('🔄 Fetching tributes count...');
            const response = await fetch(`${WORDPRESS_API_BASE}/tributes?per_page=1&count=true`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tributes count');
            const data = await response.json();
            console.log('✅ Successfully fetched tributes count:', data.total);
            return json({ count: data.total });
        }

        // If recent is true, return most recent tributes
        if (recent) {
            console.log('🔄 Fetching recent tributes...');
            const response = await fetch(`${WORDPRESS_API_BASE}/tributes?per_page=5`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch recent tributes');
            const data = await response.json();
            console.log('✅ Successfully fetched recent tributes:', {
                total: data.total,
                tributesReceived: data.tributes.length
            });
            return json(data);
        }

        // If ID is provided, fetch single tribute
        if (tributeId) {
            console.log('🔄 Fetching single tribute with ID:', tributeId);
            const response = await fetch(`${WORDPRESS_API_BASE}/tributes/${tributeId}`, {
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

            const data = await response.json();
            console.log('✅ Successfully fetched tribute:', { id: data.id, title: data.title });
            return json(data);
        }

        // Otherwise, fetch paginated list of tributes
        console.log('🔄 Fetching paginated tributes list...');
        const apiUrl = `${WORDPRESS_API_BASE}/tributes?page=${page}&per_page=${perPage}${search ? `&search=${search}` : ''}`;
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

        const data = await response.json();
        console.log('✅ Successfully fetched tributes:', {
            total: data.total,
            totalPages: data.total_pages,
            currentPage: data.current_page,
            tributesReceived: data.tributes.length
        });

        return json(data);
    } catch (error) {
        console.error('💥 Error in tributes endpoint:', error);
        return json({ error: 'Failed to fetch tributes data' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received POST request to create tribute');

    if (!locals.user?.isAdmin) {
        console.error('🚫 Unauthorized access attempt - user is not admin');
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        console.error('🚫 No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const tributeData = await request.json();
        console.log('📝 Creating new tribute with data:', tributeData);

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
            console.error('❌ Failed to create tribute:', error);
            return json({ error: error.message }, { status: response.status });
        }

        const newTribute = await response.json();
        console.log('✅ Successfully created tribute:', { id: newTribute.id, title: newTribute.title });
        return json(newTribute, { status: 201 });
    } catch (error) {
        console.error('💥 Error creating tribute:', error);
        return json({ error: 'Failed to create tribute' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received PUT request to update tribute');

    if (!locals.user?.isAdmin) {
        console.error('🚫 Unauthorized access attempt - user is not admin');
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        console.error('🚫 No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const tributeData = await request.json();
        const { id, ...updateData } = tributeData;

        if (!id) {
            console.error('❌ Update request missing tribute ID');
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        console.log('📝 Updating tribute:', { id, updateData });

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
            console.error('❌ Failed to update tribute:', error);
            return json({ error: error.message }, { status: response.status });
        }

        const updatedTribute = await response.json();
        console.log('✅ Successfully updated tribute:', { id: updatedTribute.id, title: updatedTribute.title });
        return json(updatedTribute);
    } catch (error) {
        console.error('💥 Error updating tribute:', error);
        return json({ error: 'Failed to update tribute' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received DELETE request for tribute');

    if (!locals.user?.isAdmin) {
        console.error('🚫 Unauthorized access attempt - user is not admin');
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        console.error('🚫 No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id) {
            console.error('❌ Delete request missing tribute ID');
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        console.log('🗑️ Attempting to delete tribute:', { id });

        const response = await fetch(`${WORDPRESS_API_BASE}/tributes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Failed to delete tribute:', error);
            return json({ error: error.message }, { status: response.status });
        }

        console.log('✅ Successfully deleted tribute:', { id });
        return json({ success: true });
    } catch (error) {
        console.error('💥 Error deleting tribute:', error);
        return json({ error: 'Failed to delete tribute' }, { status: 500 });
    }
};
