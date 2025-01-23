import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/wp/v2';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
    console.log('📥 Received GET request for tributes');
    // Check if user is logged in and is admin
    if (!locals.user?.isAdmin) {
        return new Response('Unauthorized', { status: 401 });
    }

    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    const recent = url.searchParams.get('recent') === 'true';
    const count = url.searchParams.get('count') === 'true';

    try {
        // If count is true, return total count
        if (count) {
            const response = await fetch(`${WORDPRESS_API_BASE}/posts?post_type=tribute&per_page=1`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tributes count');
            const total = parseInt(response.headers.get('X-WP-Total') || '0');
            return json({ count: total });
        }

        // If recent is true, return most recent tributes
        if (recent) {
            const response = await fetch(`${WORDPRESS_API_BASE}/posts?post_type=tribute&per_page=5&orderby=date&order=desc`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch recent tributes');
            const tributes = await response.json();
            const total = parseInt(response.headers.get('X-WP-Total') || '0');

            // Transform WordPress post format to our tribute format
            const transformedTributes = tributes.map((tribute: any) => ({
                id: tribute.id.toString(),
                loved_one_name: tribute.title?.rendered || 'Untitled',
                created_at: tribute.date,
                slug: tribute.slug,
                user_id: tribute.author.toString()
            }));

            return json({ recent: transformedTributes, total });
        }

        // Default case: return error
        return json({ error: 'Invalid request parameters' }, { status: 400 });
    } catch (error) {
        console.error('Error in tributes endpoint:', error);
        return json({ error: 'Failed to fetch tributes data' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, url, cookies, locals }) => {
    console.log('📥 Received PUT request for tribute custom HTML');

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

    // Get tribute ID from URL path
    const pathParts = url.pathname.split('/');
    const tributeId = pathParts[pathParts.length - 2]; // Get second to last part (before /custom-html)
    
    if (!tributeId || pathParts[pathParts.length - 1] !== 'custom-html') {
        console.error('❌ Invalid URL format for custom HTML update');
        return json({ error: 'Invalid request URL' }, { status: 400 });
    }

    try {
        const data = await request.json();
        if (!data.custom_html) {
            console.error('❌ No custom HTML provided in request body');
            return json({ error: 'Custom HTML is required' }, { status: 400 });
        }

        console.log(`🔄 Updating custom HTML for tribute ${tributeId}`);
        
        // Update the post meta using WordPress REST API
        const response = await fetch(`${WORDPRESS_API_BASE}/posts/${tributeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                meta: {
                    custom_html: data.custom_html
                }
            })
        });

        if (!response.ok) {
            console.error('❌ Failed to update custom HTML:', response.status, response.statusText);
            throw new Error('Failed to update custom HTML');
        }

        console.log('✅ Successfully updated custom HTML');
        return json({ success: true });
    } catch (error) {
        console.error('💥 Error updating custom HTML:', error);
        return json({ error: 'Failed to update custom HTML' }, { status: 500 });
    }
};
