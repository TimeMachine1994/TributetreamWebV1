import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        // 1. Get form data sent by the user
        const formData = await request.formData();
        const username = formData.get('username'); // Extract username
        const password = formData.get('password'); // Extract password

        // 2. Authenticate the user with WordPress
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            return { error: 'Invalid credentials' }; // If login fails, return an error
        }

        const { token } = await response.json();

        // 3. Set JWT as a secure cookie
        cookies.set('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/'
        });

        // 4. Fetch the user role
        const roleResponse = await fetch('https://wp.tributestream.com/wp-json/custom/v1/user-role', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!roleResponse.ok) {
            return { error: 'Failed to fetch user role' };
        }

        const { roles } = await roleResponse.json();

        // 5. Redirect based on user role
        if (roles.includes('administrator')) {
            throw redirect(302, '/admin');
        } else {
            throw redirect(302, '/dashboard');
        }
    }
};
