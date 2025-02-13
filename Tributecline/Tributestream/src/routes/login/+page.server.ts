import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

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

            // The JWT token is already set by the /api/auth endpoint
            // We just need to handle the response

            return {
                success: true,
                user: {
                    display_name: result.user_display_name,
                    email: result.user_email,
                    nicename: result.user_nicename
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                error: 'An error occurred during login'
            });
        }
    }
} satisfies Actions;