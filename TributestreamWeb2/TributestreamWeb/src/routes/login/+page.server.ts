import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BASE_WORDPRESS_API } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies }) => {
    const token = await cookies.get('jwt');
    if (token) {
        throw redirect(302, '/dashboard');
    }
    return { user: null };
};

const handleLogin = async (cookies: App.Cookies, username: string, password: string) => {
    const response = await fetch(`${BASE_WORDPRESS_API}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (!response.ok) {
        return fail(400, {
            error: true,
            message: result?.message || 'Invalid credentials'
        });
    }

    cookies.set('jwt', result.token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return result;
};

export const actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !password) {
            return fail(400, {
                error: true,
                message: 'Username and password are required'
            });
        }

        try {
            const result = await handleLogin(cookies, username, password);
            
            if ('error' in result) {
                return result;
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred'
            });
        }
    }
} satisfies Actions;