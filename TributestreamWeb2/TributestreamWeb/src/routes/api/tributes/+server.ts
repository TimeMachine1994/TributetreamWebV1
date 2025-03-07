import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

const validateJWT = (jwt: string | undefined) => {
    if (!jwt) {
        throw new Error('No JWT provided');
    }
    // In production, you would validate the JWT here
    return true;
};

export const GET: RequestHandler = async ({ url, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const page = url.searchParams.get('page') || '1';
        const perPage = url.searchParams.get('per_page') || '10';
        const search = url.searchParams.get('search') || '';

        const wpApiUrl = new URL(`${WP_API_BASE}/tributes`);
        wpApiUrl.searchParams.set('page', page);
        wpApiUrl.searchParams.set('per_page', perPage);
        wpApiUrl.searchParams.set('orderby', 'date');
        wpApiUrl.searchParams.set('order', 'desc');
        if (search) {
            wpApiUrl.searchParams.set('search', search);
        }

        const response = await fetch(wpApiUrl, {
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tributes from WordPress');
        }

        const data = await response.json();
        return json({
            tributes: data.tributes || [],
            total_pages: data.total_pages || 1
        });
    } catch (error) {
        console.error('Error fetching tributes:', error);
        return json({
            tributes: [],
            total_pages: 1,
            error: error instanceof Error ? error.message : 'Failed to fetch tributes'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const POST: RequestHandler = async ({ request, fetch, locals }) => {
    console.log('🚀 [POST] Creating a new tribute...');
    console.time('⏳ Tribute Creation Time');

    try {
        // Validate JWT
        console.log('🔐 Validating JWT...');
        validateJWT(locals.jwt);
        console.log('✅ JWT validated.');

        // Parse incoming request JSON
        console.log('📝 Parsing tribute data from request...');
        const tributeData = await request.json();
        console.log('📦 Parsed tribute data fields:', Object.keys(tributeData));
        console.log('🔍 Required fields check:');
        console.log('   - title:', Boolean(tributeData.title));
        console.log('   - slug:', Boolean(tributeData.slug));
        console.log('   - user_name:', Boolean(tributeData.user_name));
        console.log('   - user_email:', Boolean(tributeData.user_email));
        console.log('   - user_id:', Boolean(tributeData.user_id));

        if (!tributeData.title || !tributeData.slug || !tributeData.user_name || !tributeData.user_email) {
            console.error('❌ Missing required tribute fields');
            return json({
                tribute: null,
                success: false,
                error: 'Missing required tribute fields'
            }, { status: 400 });
        }

        // Send the data to WordPress API
        console.log(`🚀 Sending tribute to WordPress API: ${WP_API_BASE}/tributes`);
        console.time('⏳ API Request Time');
        
        // Ensure we're sending the right content type
        const response = await fetch(`${WP_API_BASE}/tributes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(tributeData)
        });
        console.timeEnd('⏳ API Request Time');

        if (!response.ok) {
            let errorMessage = 'Failed to create tribute';
            let errorDetails = {};
            try {
                const errorResponse = await response.json();
                console.error('❌ Tribute creation failed:', errorResponse);
                errorMessage = errorResponse.message || errorMessage;
                errorDetails = errorResponse;
            } catch (parseError) {
                console.error('❌ Failed to parse error response:', await response.text());
            }
            
            return json({
                tribute: null,
                success: false,
                error: errorMessage,
                details: errorDetails
            }, { status: response.status });
        }

        // Parse response from WordPress
        console.log('✅ Tribute created successfully. Parsing response...');
        let data;
        try {
            data = await response.json();
            console.log('🎉 Received response data:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse API response:', parseError);
            return json({
                tribute: { id: null },
                success: true,
                warning: 'Tribute was created but response could not be parsed'
            });
        }

        console.timeEnd('⏳ Tribute Creation Time');
        return json({
            tribute: data,
            success: true
        });
    } catch (error) {
        console.error('💥 Error creating tribute:', error);
        console.timeEnd('⏳ Tribute Creation Time');
        return json({
            tribute: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};

export const PUT: RequestHandler = async ({ request, fetch, locals }) => {
    console.log('🚀 [PUT] Updating a tribute...');
    console.time('⏳ Tribute Update Time');

    try {
        // Validate JWT
        console.log('🔐 Validating JWT...');
        validateJWT(locals.jwt);
        console.log('✅ JWT validated.');

        // Parse incoming request JSON
        console.log('📝 Parsing tribute update data from request...');
        const { id, ...data } = await request.json();
        console.log('📦 Parsed tribute update data:', { id, ...data });

        if (!id) {
            console.error('❌ Tribute ID is missing.');
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        // Send the updated data to WordPress API
        console.log(`🚀 Sending updated tribute to WordPress API: ${WP_API_BASE}/tributes/${id}`);
        console.time('⏳ API Update Request Time');
        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.timeEnd('⏳ API Update Request Time');

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('❌ Tribute update failed:', errorResponse);
            throw new Error(errorResponse.message || 'Failed to update tribute');
        }

        // Parse response from WordPress
        console.log('✅ Tribute updated successfully. Parsing response...');
        const updatedTribute = await response.json();
        console.log('🎉 Received updated tribute data:', updatedTribute);

        console.timeEnd('⏳ Tribute Update Time');
        return json({
            tribute: updatedTribute,
            success: true
        });
    } catch (error) {
        console.error('💥 Error updating tribute:', error);
        console.timeEnd('⏳ Tribute Update Time');
        return json({
            tribute: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};


export const DELETE: RequestHandler = async ({ request, fetch, locals }) => {
    try {
        // Validate JWT
        validateJWT(locals.jwt);

        const { id } = await request.json();
        
        if (!id) {
            return json({ error: 'Tribute ID is required' }, { status: 400 });
        }

        const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${locals.jwt}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete tribute');
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting tribute:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete tribute'
        }, { status: error instanceof Error && error.message === 'No JWT provided' ? 401 : 500 });
    }
};
