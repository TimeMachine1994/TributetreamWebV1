import { error, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw error(401, 'Invalid credentials');
        }

        const result = await response.json();
         // Set the JWT in cookies with secure settings
        cookies.set('jwt', result.token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Redirect to dashboard after successful login
        throw redirect(302, '/dashboard');
    }
};
