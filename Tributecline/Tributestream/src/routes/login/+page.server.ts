import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/stores/authStore.svelte';
import { mockAuthenticate } from '$lib/stores/mockData';

type ActionData = {
    success: boolean;
    username?: string;
    error?: string;
    user?: {
        email: string;
        displayName: string;
        roles: string[];
        role?: string;
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
    default: async ({ request, locals }) => {
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
            // Use mock authentication instead of API calls
            const authResult = mockAuthenticate(username, password);

            if (!authResult.success || !authResult.user) {
                return fail(401, {
                    success: false,
                    username,
                    error: authResult.error || 'Authentication failed'
                } as ActionData);
            }

            const { user } = authResult;

            // Update locals.auth with the user information
            locals.auth = {
                isAuthenticated: true,
                token: user.token || '',
                userId: user.id.toString(), // Convert id to string
                role: user.roles[0], // Primary role
                roles: user.roles,   // All roles
                calculatorStatus: user.meta?.calculatorStatus || null
            };

            // Return success with user data
            return {
                success: true,
                username,
                user: {
                    email: user.email,
                    displayName: user.displayName,
                    roles: user.roles,
                    role: user.roles[0] // Keep for backwards compatibility
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