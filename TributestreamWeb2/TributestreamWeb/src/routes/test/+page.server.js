import { redirect, fail } from '@sveltejs/kit';

// Constants
const AUTH_COOKIE = 'test_auth_cookie';
const JWT_COOKIE = 'jwt';
const API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

// Mock JWT for testing
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.2hDgYvYRtr7VZivY0vYqKz9_PX_yNRMc9l5F5qXWXxs';

// Load function to check authentication
export const load = ({ cookies, url }) => {
    const isAuthenticated = cookies.get(AUTH_COOKIE) === 'authenticated';
    const jwt = isAuthenticated ? cookies.get(JWT_COOKIE) : null;
    const formError = url.searchParams.get('error');

    return {
        authenticated: isAuthenticated,
        jwt,
        form: formError ? { error: formError } : null
    };
};

// Define actions
export const actions = {
    // Login: Sets a cookie for authentication
    login: async ({ request, cookies }) => {
        try {
            const formData = await request.formData();
            const username = formData.get('username');
            const password = formData.get('password');

            // Mock auth validation
            if (username === 'test' && password === 'password') {
                // Set both test auth cookie and JWT
                cookies.set(AUTH_COOKIE, 'authenticated', { path: '/', httpOnly: true, maxAge: 3600 });
                cookies.set(JWT_COOKIE, TEST_JWT, { path: '/', httpOnly: true, maxAge: 3600 });
                
                // Set mock user data
                cookies.set('user', JSON.stringify({
                    displayName: 'Test User',
                    roles: ['user'],
                    isAdmin: true
                }), { path: '/', httpOnly: true, maxAge: 3600 });
                
                throw redirect(303, '/test');
            }

            return fail(401, { error: 'Invalid username or password' });
        } catch (error) {
            if (error instanceof Response) throw error;
            return fail(500, { error: 'Internal server error' });
        }
    },

    // Logout: Clears the auth cookie
    logout: async ({ cookies }) => {
        try {
            cookies.delete(AUTH_COOKIE, { path: '/' });
            cookies.delete(JWT_COOKIE, { path: '/' });
            cookies.delete('user', { path: '/' });
            throw redirect(303, '/test');
        } catch (error) {
            if (error instanceof Response) throw error;
            return fail(500, { error: 'Failed to logout' });
        }
    },

    // Create tribute
    create: async ({ request, cookies, fetch }) => {
        if (!cookies.get(AUTH_COOKIE)) {
            return fail(401, { error: 'Not authenticated' });
        }

        try {
            const formData = await request.formData();
            const tribute = {
                user_id: formData.get('user_id'),
                loved_one_name: formData.get('loved_one_name'),
                slug: formData.get('slug'),
                phone_number: formData.get('phone_number')
            };

            const jwt = cookies.get(JWT_COOKIE);
            if (!jwt) {
                return fail(401, { error: 'No JWT found' });
            }

            const res = await fetch(`${API_BASE}/tributes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(tribute)
            });

            if (!res.ok) {
                const error = await res.json();
                return fail(res.status, { 
                    error: error.message || 'Failed to create tribute',
                    fields: tribute
                });
            }

            throw redirect(303, '/test');
        } catch (error) {
            if (error instanceof Response) throw error;
            console.error('Error creating tribute:', error);
            return fail(500, { 
                error: 'Internal server error',
                fields: Object.fromEntries(await request.formData())
            });
        }
    }
};
