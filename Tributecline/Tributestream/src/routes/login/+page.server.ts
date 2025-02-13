import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { User } from '$lib/stores/userStore';
import { validateToken } from '$lib/utils/security';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
    const token = cookies.get('auth_token');
    
    if (token) {
        const isValid = await validateToken(token, fetch);
        if (isValid) {
            // Get the return URL from the query parameter or default to family-dashboard
            const returnUrl = url.searchParams.get('returnUrl') || '/family-dashboard';
            throw redirect(302, returnUrl);
        }
    }
    
    // If no token or invalid token, continue to login page
    return {};
};

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        if (!username || !password) {
            return fail(400, {
                error: 'Username and password are required'
            });
        }

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!response.ok) {
                return fail(response.status, {
                    error: result.message || 'Login failed'
                });
            }

            // Transform the authentication data to match our User interface
            const user: User = {
                id: -1, // We'll need to fetch this separately
                username: username.toString(),
                email: result.user_email,
                displayName: result.user_display_name,
                roles: [], // We'll need to fetch these separately
                meta: {},
                token: cookies.get('auth_token') // The token is already set in the cookie by the auth endpoint
            };

            // Return success, user data, and redirect URL
            return {
                success: true,
                user,
                redirectTo: '/family-dashboard'
            };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                error: 'An error occurred during login'
            });
        }
    }
} satisfies Actions;