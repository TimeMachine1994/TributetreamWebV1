import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        const response = await fetch('http://localhost/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return fail(400, { 
                error: true, 
                message: result.message 
            });
        }

        // Store the JWT token in a secure HTTP-only cookie
        cookies.set('jwt', result.token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        throw redirect(302, '/dashboard');
    }
} satisfies Actions;
