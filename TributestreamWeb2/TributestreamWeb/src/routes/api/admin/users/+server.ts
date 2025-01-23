import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_API_BASE = 'https://wp.tributestream.com/wp-json/wp/v2';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
    console.log('📥 Received GET request for users endpoint');
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

    const userId = url.searchParams.get('id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    const search = url.searchParams.get('search') || '';
    const count = url.searchParams.get('count') === 'true';
    const recent = url.searchParams.get('recent') === 'true';

    // If count is true, return total count
    if (count) {
        console.log('🔄 Fetching users count...');
        try {
            const apiUrl = `${WORDPRESS_API_BASE}/users?per_page=1`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) {
                console.error('❌ Failed to fetch users count:', response.status, response.statusText);
                throw new Error('Failed to fetch users count');
            }
            const total = parseInt(response.headers.get('X-WP-Total') || '0');
            console.log('✅ Successfully fetched users count:', total);
            return json({ count: total });
        } catch (error) {
            console.error('💥 Error fetching user count:', error);
            return json({ error: 'Failed to fetch user count' }, { status: 500 });
        }
    }

    // If recent is true, return most recent users
    if (recent) {
        console.log('🔄 Fetching recent users...');
        try {
            const apiUrl = `${WORDPRESS_API_BASE}/users?per_page=5&orderby=registered&order=desc`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (!response.ok) {
                console.error('❌ Failed to fetch recent users:', response.status, response.statusText);
                throw new Error('Failed to fetch recent users');
            }
            const users = await response.json();
            console.log('✅ Successfully fetched recent users:', {
                usersReceived: users.length,
                users: users.map((u: any) => ({ id: u.id, name: u.name }))
            });
            return json({ users });
        } catch (error) {
            console.error('💥 Error fetching recent users:', error);
            return json({ error: 'Failed to fetch recent users' }, { status: 500 });
        }
    }

    // If ID is provided, fetch single user
    if (userId) {
        console.log('🔄 Fetching single user with ID:', userId);
        try {
            const apiUrl = `${WORDPRESS_API_BASE}/users/${userId}`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, { 
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            
            if (!response.ok) {
                const message = await response.text();
                console.error('❌ Failed to fetch user:', {
                    status: response.status,
                    statusText: response.statusText,
                    details: message
                });
                return json({ 
                    error: 'Failed to fetch user data', 
                    details: message
                }, { status: response.status });
            }

            const fullUserData = await response.json();
            
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

            console.log('✅ Successfully fetched user:', { id: userData.id, name: userData.name });
            return json(userData, { 
                status: 200,
                headers: {
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate'
                }
            });
        } catch (error: unknown) {
            console.error('💥 Error fetching user:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return json({ 
                error: 'An error occurred', 
                details: errorMessage
            }, { status: 500 });
        }
    }

    // Otherwise, fetch paginated list of users
    console.log('🔄 Fetching paginated users list...');
    try {
        const queryParams = new URLSearchParams({
            per_page: perPage.toString(),
            page: page.toString(),
            search: search,
            orderby: 'registered',
            order: 'desc'
        });

        const apiUrl = `${WORDPRESS_API_BASE}/users?${queryParams}`;
        console.log('🌐 Making request to:', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const message = await response.text();
            console.error('❌ Failed to fetch users:', {
                status: response.status,
                statusText: response.statusText,
                details: message
            });
            return json({ error: 'Failed to fetch users', details: message }, { status: response.status });
        }

        const users = await response.json();
        const total = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

        console.log('✅ Successfully fetched users:', {
            total,
            totalPages,
            currentPage: page,
            usersReceived: users.length
        });

        return json({
            users: users.map((user: any) => ({
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
        console.error('💥 Error fetching users:', error);
        return json({ error: 'Failed to fetch users' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received POST request to create user');

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

    try {
        const userData = await request.json();
        console.log('📝 Creating new user with data:', {
            ...userData,
            password: userData.password ? '[REDACTED]' : undefined
        });

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
            console.error('❌ Failed to create user:', error);
            return json({ error: error.message }, { status: response.status });
        }

        const newUser = await response.json();
        console.log('✅ Successfully created user:', { id: newUser.id, name: newUser.name });
        return json(newUser, { status: 201 });
    } catch (error) {
        console.error('💥 Error creating user:', error);
        return json({ error: 'Failed to create user' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received PUT request to update user');

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

    try {
        const userData = await request.json();
        const { id, ...updateData } = userData;

        if (!id) {
            console.error('❌ Update request missing user ID');
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        console.log('📝 Updating user:', { id, updateData: {
            ...updateData,
            password: updateData.password ? '[REDACTED]' : undefined
        }});

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
            console.error('❌ Failed to update user:', error);
            return json({ error: error.message }, { status: response.status });
        }

        const updatedUser = await response.json();
        console.log('✅ Successfully updated user:', { id: updatedUser.id, name: updatedUser.name });
        return json(updatedUser);
    } catch (error) {
        console.error('💥 Error updating user:', error);
        return json({ error: 'Failed to update user' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, cookies, locals }) => {
    console.log('📥 Received DELETE request for user');

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

    try {
        const { id } = await request.json();
        if (!id) {
            console.error('❌ Delete request missing user ID');
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        console.log('🗑️ Attempting to delete user:', { id });

        const response = await fetch(`${WORDPRESS_API_BASE}/users/${id}?force=true`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Failed to delete user:', error);
            return json({ error: error.message }, { status: response.status });
        }

        console.log('✅ Successfully deleted user:', { id });
        return json({ success: true });
    } catch (error) {
        console.error('💥 Error deleting user:', error);
        return json({ error: 'Failed to delete user' }, { status: 500 });
    }
};
