import { redirect } from '@sveltejs/kit';

export async function load({ cookies, fetch }) {
    const jwt = cookies.get('jwt');

    if (jwt) {
        // Validate the JWT with the WordPress API
        const validateResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
            method: 'POST',
            headers: { Authorization: `Bearer ${jwt}` }
        });

        if (validateResponse.ok) {
            // If the token is valid, redirect the user
            throw redirect(302, '/dashboard');
        } else {
            // Invalid token: clear the cookie
            cookies.delete('jwt');
        }
    }

    return {}; // Return empty data for the login page to render
}
