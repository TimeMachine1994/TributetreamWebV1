import { error, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, fetch }) => {
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
        return { token: result.token };
    }
};
