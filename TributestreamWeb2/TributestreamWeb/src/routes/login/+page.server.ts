import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        try {
            // Step 1: Extract form data
            const formData = await request.formData();
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;

            if (!username || !password) {
                console.error('Missing username or password');
                return { error: 'Username and password are required' };
            }

            console.log('Attempting login for user:', username);

            // Step 2: Authenticate with WordPress
            const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            console.log('Token POST response status:', loginResponse.status);

            if (!loginResponse.ok) {
                const errorBody = await loginResponse.json();
                console.error('Token POST failed:', errorBody);
                return { error: `Login failed: ${errorBody.message || 'Unknown error'}` };
            }

            const { token } = await loginResponse.json();

            if (!token || !token.match(/^ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
                console.error('Invalid JWT received:', token);
                return { error: 'Invalid token received from the server' };
            }

            console.log('Token retrieved successfully:', token);

            // Step 3: Set JWT as a cookie
            cookies.set('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/'
            });

            console.log('JWT cookie set successfully');

            // Step 4: Fetch user role
            const roleResponse = await fetch('https://wp.tributestream.com/wp-json/custom/v1/user-role', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('User role response status:', roleResponse.status);

            if (!roleResponse.ok) {
                const roleErrorBody = await roleResponse.json();
                console.error('User role request failed:', roleErrorBody);
                return { error: 'Failed to fetch user role' };
            }

            const { roles } = await roleResponse.json();
            console.log('User roles retrieved:', roles);

            // Step 5: Redirect based on role
            if (roles.includes('administrator')) {
                throw redirect(302, '/admin');
            } else {
                throw redirect(302, '/dashboard');
            }
        } catch (err) {
            console.error('Unexpected error in login action:', err);
            return { error: 'An unexpected error occurred. Please try again.' };
        }
    }
};
