// src/routes/api/user_data/+server.js
import { json } from '@sveltejs/kit';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/wp/v2';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    console.log('📥 Incoming request to /api/user_data');
    
    // Get JWT from cookies
    const jwtToken = cookies.get('jwt');
    console.log('🔑 JWT token present in cookies:', !!jwtToken);

    if (!jwtToken) {
        console.log('❌ No JWT token found in cookies');
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = url.searchParams.get('id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    const search = url.searchParams.get('search') || '';
    const count = url.searchParams.get('count') === 'true';
    const recent = url.searchParams.get('recent') === 'true';

    // If count is true, return total count
    if (count) {
        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/users?per_page=1`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            const total = parseInt(response.headers.get('X-WP-Total') || '0');
            return json({ count: total });
        } catch (error) {
            console.error('Error fetching user count:', error);
            return json({ error: 'Failed to fetch user count' }, { status: 500 });
        }
    }

    // If recent is true, return most recent users
    if (recent) {
        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/users?per_page=5&orderby=registered&order=desc`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch recent users');
            const users = await response.json();
            return json({ users });
        } catch (error) {
            console.error('Error fetching recent users:', error);
            return json({ error: 'Failed to fetch recent users' }, { status: 500 });
        }
    }

    // If ID is provided, fetch single user
    if (userId) {

        try {
            const response = await fetch(`${WORDPRESS_API_BASE}/users/${userId}`, { 
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            
            if (!response.ok) {
                const message = await response.text();
                return json({ 
                    error: 'Failed to fetch user data', 
                    details: message
                }, { status: response.status });
            }

            const fullUserData = await response.json();
            
            // Extract only the fields we need
            const userData = {
                id: fullUserData.id,
                name: fullUserData.name,
                email: fullUserData.email,
                nickname: fullUserData.nickname,
                firstName: fullUserData.first_name,
                lastName: fullUserData.last_name,
                avatar: fullUserData.avatar_urls,
                description: fullUserData.description,
                url: fullUserData.url,
                roles: fullUserData.roles
            };

            return json(userData, { 
                status: 200,
                headers: {
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate'
                }
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            return json({ 
                error: 'An error occurred', 
                details: error.message
            }, { status: 500 });
        }
    }

    // Otherwise, fetch paginated list of users
    try {
        const queryParams = new URLSearchParams({
            per_page: perPage.toString(),
            page: page.toString(),
            search: search,
            orderby: 'registered',
            order: 'desc'
        });

        const response = await fetch(`${WORDPRESS_API_BASE}/users?${queryParams}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const message = await response.text();
            return json({ error: 'Failed to fetch users', details: message }, { status: response.status });
        }

        const users = await response.json();
        const total = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

        return json({
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                nickname: user.nickname,
                firstName: user.first_name,
                lastName: user.last_name,
                avatar: user.avatar_urls,
                description: user.description,
                url: user.url,
                roles: user.roles
            })),
            total,
            totalPages,
            page,
            perPage
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const userData = await request.json();
        const response = await fetch(`${WORDPRESS_API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ error: error.message }, { status: response.status });
        }

        const newUser = await response.json();
        return json(newUser, { status: 201 });
    } catch (error) {
        return json({ error: 'Failed to create user' }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, cookies }) {
    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const userData = await request.json();
        const { id, ...updateData } = userData;

        if (!id) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        const response = await fetch(`${WORDPRESS_API_BASE}/users/${id}`, {
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

        const updatedUser = await response.json();
        return json(updatedUser);
    } catch (error) {
        return json({ error: 'Failed to update user' }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, cookies }) {
    const jwtToken = cookies.get('jwt');
    if (!jwtToken) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        const response = await fetch(`${WORDPRESS_API_BASE}/users/${id}?force=true`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return json({ error: error.message }, { status: response.status });

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
