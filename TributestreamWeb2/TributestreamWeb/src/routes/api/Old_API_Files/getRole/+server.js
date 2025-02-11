import { json } from '@sveltejs/kit';

/**
 * SvelteKit server API endpoint to fetch user roles from a WordPress backend.
 * @param {import('@sveltejs/kit').RequestEvent} event - The request event.
 */
export async function GET({ url }) {
    // Get the `id` query parameter from the request URL
    const userId = url.searchParams.get('id');

    console.log('🔍 [Get Role API] Request received with userId:', userId);

    // Validate the user ID
    if (!userId) {
        console.warn('⚠️ [Get Role API] Missing userId in request.');
        return json(
            { error: 'User ID is required.' },
            { status: 400 } // Bad Request
        );
    }

    try {
        // Fetch roles from the WordPress API
        console.log(`🌍 [Get Role API] Fetching from WordPress API: https://wp.tributestream.com/wp-json/tributestream/v1/getRole?id=${userId}`);
        
        const wpResponse = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/getRole?id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('🛬 [Get Role API] Response received from WordPress API.');
        console.log('   Status:', wpResponse.status);

        // Check if the response is okay
        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('❌ [Get Role API] Error from WordPress API:', errorData);
            return json(
                { error: errorData.message || 'Failed to fetch roles.' },
                { status: wpResponse.status }
            );
        }

        // Parse the WordPress API response
        const data = await wpResponse.json();
        console.log('📝 [Get Role API] Parsed response:', data);

        // Ensure roles is always an array
        const roles = Array.isArray(data.roles) ? data.roles : [];

        console.log('✅ [Get Role API] Returning roles:', roles);
        
        // Return the user roles
        return json(
            { user_id: data.user_id, roles },
            { status: 200 }
        );
    } catch (err) {
        console.error('🚨 [Get Role API] Unexpected error:', err);
        return json(
            { error: 'An unexpected error occurred.', details: err.message },
            { status: 500 } // Internal Server Error
        );
    }
}
