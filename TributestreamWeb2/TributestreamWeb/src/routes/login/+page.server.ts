import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        // Authenticate with WordPress
        const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginResponse.ok) {
            return { error: 'Invalid credentials' };
        }

        const { token } = await loginResponse.json();

        // Set JWT as HttpOnly and Secure cookie
        cookies.set('jwt', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        });

        // Fetch user role
        const roleResponse = await fetch('https://wp.tributestream.com/wp-json/custom/v1/user-role', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!roleResponse.ok) {
            return { error: 'Failed to fetch user role' };
        }

        const { roles } = await roleResponse.json();

        // Redirect based on role
        if (roles.includes('administrator')) {
            throw redirect(302, '/admin');
        } else {
            throw redirect(302, '/dashboard');
        }
    }
};
