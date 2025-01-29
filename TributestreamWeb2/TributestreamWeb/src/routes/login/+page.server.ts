import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, cookies, fetch }) => {
        console.log('🚀 [Login Action] Triggered default action.');

        // Step 1: Extract form data
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');
        console.log('📝 [Login Action] Form data extracted:', { username, password });

        // Check for missing credentials
        if (!username || !password) {
            console.warn('⚠️ [Login Action] Missing username or password.');
            return fail(400, { error: 'Both username and password are required.' });
        }

        let result;
        let roles: string[] = []; // Fix: Ensure `roles` is defined before using it

        try {
            console.log('🔄 [Login Action] Sending login request to /api/auth...');

            // Step 2: Send login request to API
            const response = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('🛬 [Login Action] Received response from /api/auth. Status Code:', response.status);

            // Step 3: Parse the response
            result = await response.json();
            console.log('📝 [Login Action] Parsed response JSON:', result);

            // Ensure the login was successful and user_id is available
            if (!response.ok || !result.user_id) {
                console.error('❌ [Login Action] Login failed or missing user_id.');
                return fail(400, { error: result.message || 'Login failed.' });
            }

            console.log('✅ [Login Action] Extracted user_id:', result.user_id);

            // Step 4: Set JWT token cookie
            cookies.set('jwt', result.token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            // Step 5: Store user_id in cookies
            cookies.set('user_id', result.user_id, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            console.log('✅ [Login Action] user_id cookie set:', result.user_id);

            // Step 6: Fetch Roles using the user_id
            console.log(`🔄 [Login Action] Fetching roles from /api/getRole?id=${result.user_id}...`);
            const rolesResponse = await fetch(`/api/getRole?id=${result.user_id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('🛬 [Login Action] Received response from /api/getRole. Status Code:', rolesResponse.status);
            const rolesData = await rolesResponse.json();
            console.log('📝 [Login Action] Parsed roles response:', rolesData);

            // Ensure roles is always an array
            roles = Array.isArray(rolesData.roles) ? rolesData.roles : [];
            console.log('✅ [Login Action] Final roles:', roles);

            // Step 7: Set user data with roles
            cookies.set(
                'user',
                JSON.stringify({
                    displayName: result.user_display_name,
                    email: result.user_email,
                    nicename: result.user_nicename,
                    roles,
                    isAdmin: roles.includes('administrator')
                }),
                {
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 // 24 hours
                }
            );

        } catch (error) {
            console.error('🚨 [Login Action] Error during login:', error);
            return fail(500, { error: 'Internal server error' });
        }

        // Define redirect path based on user role
        let redirectPath = '/dashboard'; // Default user redirect
        if (roles.includes('administrator')) {
            redirectPath = '/admin-dashboard';
        } else if (roles.includes('editor')) {
            redirectPath = '/editor-dashboard'; // Redirect editors
        }

        console.log(`🚀 [Login Action] Redirecting user to: ${redirectPath}`);
        throw redirect(303, redirectPath);
    }
};
