import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) {
            return { error: 'Username and password are required.' };
        }

        try {
            // Step 1: Authenticate with WordPress
            const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!loginResponse.ok) {
                const errorBody = await loginResponse.json();
                return { error: `Login failed: ${errorBody.message}` };
            }

            const { token } = await loginResponse.json();

            // Step 2: Save the token in a secure cookie
            cookies.set('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/'
            });

            // Step 3: Fetch the user's role
            const roleResponse = await fetch('https://wp.tributestream.com/wp-json/custom/v1/user-role', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!roleResponse.ok) {
                return { error: 'Failed to fetch user role.' };
            }

            const { roles } = await roleResponse.json();

            // Step 4: Redirect securely based on the user's role
            if (roles.includes('administrator')) {
                throw redirect(302, '/admin');
            } else {
                throw redirect(302, '/dashboard');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            return { error: 'An unexpected error occurred. Please try again.' };
        }
    }
};
