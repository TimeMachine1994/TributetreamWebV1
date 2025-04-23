import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, fetch, cookies }) => {
        // Get form data
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        // Validate form data
        if (!email || !password) {
            return fail(400, {
                email,
                message: 'Email and password are required'
            });
        }

        try {
            // Call our login API endpoint
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            // If login failed
            if (!response.ok) {
                return fail(response.status, {
                    email,
                    message: data.message || 'Login failed'
                });
            }

            // Login successful - the JWT cookie is already set by the API endpoint
            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                email,
                message: 'An unexpected error occurred'
            });
        }
    }
} satisfies Actions;