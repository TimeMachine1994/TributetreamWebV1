import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/stores/authStore.svelte';

type ActionData = {
    success: boolean;
    username?: string;
    error?: string;
    user?: {
        email: string;
        displayName: string;
        role: string;
    };
}

export const load: PageServerLoad = async ({ locals, url }) => {
    // If user is already authenticated, redirect based on role
    if (locals.auth.isAuthenticated) {
        const defaultRedirect = isAdmin(locals.auth) 
            ? '/admin-dashboard' 
            : '/family-dashboard';

        throw redirect(302, url.searchParams.get('returnUrl') || defaultRedirect);
    }

    return {
        auth: locals.auth
    };
};

export const actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const username = formData.get('username')?.toString() || '';
        const password = formData.get('password')?.toString() || '';

        if (!username || !password) {
            return fail(400, {
                success: false,
                username,
                error: 'Username and password are required'
            } as ActionData);
        }

        try {
            // 1. Authenticate using our internal API endpoint
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!authResponse.ok) {
                return fail(401, {
                    success: false,
                    username,
                    error: 'Invalid credentials'
                } as ActionData);
            }

            const authData = await authResponse.json();
            
            if (!authData.success) {
                return fail(401, {
                    success: false,
                    username,
                    error: authData.error || 'Authentication failed'
                } as ActionData);
            }

            // 2. Get user role using our internal endpoint
            // Note: We need to extract user ID from the auth response
            const userId = authData.user_id; // Assuming auth endpoint returns user_id
            const roleResponse = await fetch(`/api/getRole?id=${userId}`);

            if (!roleResponse.ok) {
                return fail(500, {
                    success: false,
                    username,
                    error: 'Failed to get user role'
                } as ActionData);
            }

            const roleData = await roleResponse.json();
            const role = roleData.role || 'subscriber';

            // 3. Return success with user data
            return {
                success: true,
                username,
                user: {
                    email: authData.user_email,
                    displayName: authData.user_display_name,
                    role
                }
            } as ActionData;
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, {
                success: false,
                username,
                error: 'An unexpected error occurred'
            } as ActionData);
        }
    }
} satisfies Actions;