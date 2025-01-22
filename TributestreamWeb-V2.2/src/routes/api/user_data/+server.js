// src/routes/api/user_data/+server.js
import { json } from '@sveltejs/kit';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/wp/v2';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    console.log('📥 Incoming request to /api/user_data');
    
    const userId = url.searchParams.get('id');
    console.log('🔍 User ID from query params:', userId);

    // Get JWT from cookies
    const jwtToken = cookies.get('jwt');
    console.log('🔑 JWT token present in cookies:', !!jwtToken);

    if (!userId) {
        console.log('❌ No user ID provided in query parameters');
        return json({ error: 'User ID is required as a query parameter' }, { status: 400 });
    }

    if (!jwtToken) {
        console.log('❌ No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    // We'll use /users/me if we want the current user's data
    const wpEndpoint = `${WORDPRESS_API_BASE}/users/${userId}`;
    console.log('🔗 WordPress API endpoint:', wpEndpoint);

    try {
        const response = await fetch(wpEndpoint, { 
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        console.log('📥 WordPress API response status:', response.status);
        
        if (!response.ok) {
            const message = await response.text();
            console.log('❌ WordPress API error:', {
                status: response.status,
                message: message
            });
            return json({ 
                error: 'Failed to fetch user data', 
                details: message
            }, { status: response.status });
        }

        const fullUserData = await response.json();
        
        // Extract only the fields we need
        const userData = {
            id: fullUserData.id,
            name: fullUserData.name,           // Display name
            email: fullUserData.email,         // Email address
            nickname: fullUserData.nickname,    // Nickname
            firstName: fullUserData.first_name,
            lastName: fullUserData.last_name,
            avatar: fullUserData.avatar_urls,   // Avatar URLs if available
            description: fullUserData.description,
            url: fullUserData.url,
            roles: fullUserData.roles
        };

        console.log('✅ Successfully retrieved user data');
        console.log('📦 Formatted user data:', userData);

        return json(userData, { 
            status: 200,
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.log('💥 Unexpected error:', error);
        return json({ 
            error: 'An error occurred', 
            details: error.message
        }, { status: 500 });
    }
}