import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WP_AUTH_URL = 'https://wp.tributestream.com/wp-json/jwt-auth/v1/token';

// Helper function to decode JWT payload
function decodeJwtPayload(token: string): { data?: { user?: { id?: string } } } {
	try {
		const base64Payload = token.split('.')[1];
		const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
		return JSON.parse(payload);
	} catch (err) {
		console.error('Error decoding JWT:', err);
		return {};
	}
}

export const POST: RequestHandler = async ({ fetch, request, cookies }) => {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.username || !body.password) {
			throw error(400, 'Username and password are required');
		}

		const response = await fetch(WP_AUTH_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: body.username,
				password: body.password
			})
		});

		// If fetch fails
		if (!response.ok) {
			throw error(response.status, 'Authentication failed');
		}

		// Parse the JSON the WP JWT plugin sends back
		const data = await response.json() as {
			token?: string;
			user_email?: string;
			user_display_name?: string;
			user_nicename?: string;
		};

		// Verify we received a token
		if (!data.token) {
			throw error(500, 'No token returned from WordPress');
		}

		// Extract user ID from JWT payload
		const payload = decodeJwtPayload(data.token);
		const userId = payload.data?.user?.id;

		if (!userId) {
			throw error(500, 'Could not extract user ID from token');
		}

		// Store the token in a cookie
		cookies.set('auth_token', data.token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Return success + the relevant user fields including user_id
		return json({
			success: true,
			user_id: userId,
			user_display_name: data.user_display_name,
			user_email: data.user_email,
			user_nicename: data.user_nicename
		});
	} catch (err) {
		console.error('[/api/auth] Error:', err);

		if (err instanceof Error && 'status' in err) {
			throw err; // rethrow any SvelteKit error
		}

		throw error(500, 'Failed to authenticate with WordPress');
	}
};
