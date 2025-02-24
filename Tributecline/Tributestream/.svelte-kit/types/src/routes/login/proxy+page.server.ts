// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ locals, cookies }: Parameters<PageServerLoad>[0]) => {
    // If user is already logged in, redirect to home
    const token = cookies.get('jwt_token');
    if (token) {
        throw redirect(302, '/');
    }
    return {};
};

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();

        if (!email || !password) {
            return fail(400, {
                error: true,
                message: 'Email and password are required'
            });
        }

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                return fail(response.status, {
                    error: true,
                    message: result.message || 'Invalid email or password'
                });
            }

            // Set the JWT token in a cookie
            cookies.set('jwt_token', result.token, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'strict'
            });

            // Redirect to home page after successful login
            throw redirect(302, '/');
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                error: true,
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        }
    }
} satisfies Actions;
