import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookie } from '$lib/auth/utils';
import { getStrapiUrl } from '$lib/api/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { email, password } = await request.json();

        // Make request to Strapi auth endpoint
        const response = await fetch(getStrapiUrl('/api/auth/local'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: email,
                password: password
            })
        });

        const data = await response.json();

        // If authentication was successful
        if (response.ok && data.jwt) {
            // Store JWT token in an HTTP-only cookie
            setAuthCookie(cookies, data.jwt);

            return json({
                success: true,
                user: data.user
            });
        }

        // If authentication failed
        return new Response(
            JSON.stringify({
                success: false,
                message: data.error?.message || 'Invalid credentials'
            }),
            {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'An error occurred during login'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};
