import { error, json } from '@sveltejs/kit';
export const GET = async ({ url, cookies }) => {
    console.log('🚀 Starting GET request for user meta.');

    const token = cookies.get('jwt');
    console.log('🔑 Token retrieved from cookies:', token );

    try {
        const user_id = url.searchParams.get('user_id');
        console.log('🔍 Checking query parameter "user_id":', user_id);

        if (!user_id) {
            console.error('❌ Missing "user_id" query parameter.');
            throw error(400, 'user_id is required as a query parameter.');
        }

        if (!token) {
            console.error('❌ Missing JWT token in cookies.');
            throw error(401, 'Authentication required');
        }

        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`;
        console.log('🔗 Sending request to WordPress API:', apiUrl);

        const wpResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 WordPress API response status:', wpResponse.status);

        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('❌ WordPress API error:', {
                status: wpResponse.status,
                error: errorData
            });
            throw error(wpResponse.status, errorData.message || 'Failed to fetch meta entries.');
        }

        const responseData = await wpResponse.json();
        console.log('✅ Meta data successfully retrieved:', responseData);

        return json(responseData);
    } catch (err) {
        console.error('💥 Error occurred in GET handler:', {
            message: err.message,
            stack: err.stack,
            status: err.status || 500
        });
        throw error(500, err.message || 'Internal Server Error');
    }
};
 
export const POST = async ({ request, cookies }) => {
    console.log('🚀 Starting POST request for user meta.');

    // Retrieve the JWT token from cookies
    const token = cookies.get('jwt');
    if (!token) {
        console.error('❌ Missing JWT token in cookies.');
        throw error(401, 'Authentication required');
    }
    console.log('🔑 Token retrieved from cookies:', token);

    try {
        // Parse the request body
        const body = await request.json();
        const { user_id, meta_key, meta_value } = body;

        console.log('📦 Request body received:', body);

        // Validate required fields
        if (!user_id || !meta_key || !meta_value) {
            console.error('❌ Missing required fields in request body.', {
                user_id,
                meta_key,
                meta_value,
            });
            throw error(400, 'user_id, meta_key, and meta_value are required.');
        }

        // Construct the WordPress API URL
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta`;
        console.log('🔗 WordPress API URL constructed:', apiUrl);

        // Prepare headers
        const headers = {
            'Authorization': `Bearer ${token}`, // Include the JWT in the Authorization header
            'Content-Type': 'application/json', // Set the content type
        };

        console.log('📋 Prepared headers for WordPress API:', headers);

        // Prepare the body
        const requestBody = JSON.stringify({
            user_id,
            meta_key,
            meta_value,
        });
        console.log('📄 Prepared request body for WordPress API:', requestBody);

        // Send the request to the WordPress API
        console.log('🚀 Sending POST request to WordPress API...');
        const wpResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: requestBody,
        });

        console.log('📡 WordPress API response status:', wpResponse.status);

        // Check for errors in the WordPress API response
        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('❌ WordPress API error:', {
                status: wpResponse.status,
                error: errorData,
            });
            throw error(
                wpResponse.status,
                errorData.message || 'Failed to write meta entry.'
            );
        }

        // Parse and return the success response from WordPress
        const responseData = await wpResponse.json();
        console.log('✅ Meta data successfully written:', responseData);

        return json(responseData);
    } catch (err) {
        // Enhanced error handling for debugging
        console.error('💥 Error occurred in POST handler:', {
            message: err.message,
            stack: err.stack,
            status: err.status || 500,
        });
        throw error(500, err.message || 'Internal Server Error');
    }
};
