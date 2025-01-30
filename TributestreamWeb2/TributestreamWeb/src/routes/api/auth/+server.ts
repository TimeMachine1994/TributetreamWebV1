/**
 * SvelteKit POST endpoint for authenticating users against a WordPress backend.
 * This endpoint will:
 *   1. Accept a username/password from the request body.
 *   2. POST these credentials to the WordPress JWT Auth plugin endpoint to retrieve a JWT token.
 *   3. If successful, use that JWT token to call our custom WP plugin endpoint
 *      (/wp-json/custom-user-roles-capabilities/v1/user) to retrieve the user's roles & capabilities.
 *   4. Return the combined data (token, user info, roles, capabilities) in the JSON response.
 *
 * Note: This endpoint is written in TypeScript for SvelteKit 1.0+ (sometimes called SvelteKit 5 in early references).
 *       Make sure TypeScript is properly configured in your SvelteKit application.
 */

import type { RequestEvent } from '@sveltejs/kit';

// Define an interface for the JSON body we expect from the client
interface AuthRequestBody {
	username: string;
	password: string;
}

// Define interfaces for the WordPress JWT response
interface WpJwtResponse {
	token: string;
	user_display_name: string;
	user_email: string;
	user_nicename: string;
	// The WP JWT plugin might not normally return these,
	// but let's keep them optional in case they're present.
	roles?: string[];
	capabilities?: Record<string, boolean>;
	message?: string; // In case of error
}

// Define interfaces for the Custom Roles & Capabilities endpoint response
interface RolesCapabilitiesResponse {
	message?: string;
	user_id?: number;
	roles?: string[];
	capabilities?: Record<string, boolean>;
}

export async function POST({ request }: RequestEvent) {
	console.log('🚀 [Auth API] POST request received.');

	// -----------------------
	// Step 1: Parse incoming JSON request
	// -----------------------
	let username: string | undefined;
	let password: string | undefined;

	try {
		const requestBody: AuthRequestBody = await request.json();
		username = requestBody.username;
		password = requestBody.password;

		console.log('📝 [Auth API] Parsed request JSON:');
		console.log('   Username:', username);
		console.log('   Password:', password);
	} catch (error) {
		console.error('❌ [Auth API] Error parsing request JSON:', error);
		return new Response(JSON.stringify({ message: 'Invalid request payload' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// -----------------------
	// Step 2: Validate credentials presence
	// -----------------------
	if (!username || !password) {
		console.warn('⚠️ [Auth API] Missing username or password.');
		return new Response(JSON.stringify({ message: 'Username and password are required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// -----------------------
	// Step 3: Make request to WordPress JWT endpoint for the token
	// -----------------------
	console.log('🔄 [Auth API] Sending request to WordPress JWT endpoint...');
	let wpAuthData: WpJwtResponse;

	try {
		const wpAuthResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		console.log('🛬 [Auth API] Received response from WordPress (JWT Auth):');
		console.log('   Status Code:', wpAuthResponse.status);

		wpAuthData = await wpAuthResponse.json();

		console.log('📝 [Auth API] Parsed response JSON from WordPress (JWT Auth):');
		console.log('   Response Data:', JSON.stringify(wpAuthData, null, 2));

		// -----------------------
		// Step 4: Handle non-OK responses (e.g., bad credentials)
		// -----------------------
		if (!wpAuthResponse.ok) {
			console.error('❌ [Auth API] WordPress returned an error (JWT Auth).');
			return new Response(JSON.stringify({ message: wpAuthData.message }), {
				status: wpAuthResponse.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (error) {
		console.error('🚨 [Auth API] Error occurred while authenticating with WordPress (JWT Auth):', error);
		return new Response(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// -----------------------
	// Step 5: Now fetch roles and capabilities from our custom WP plugin endpoint
	//         using the token we just received.
	// -----------------------
	let roles: string[] = [];
	let capabilities: Record<string, boolean> = {};
    let user_id = null;
	if (wpAuthData.token) {
		console.log('🔄 [Auth API] Fetching user roles & capabilities from custom plugin endpoint...');

		try {
			const rolesCapResponse = await fetch(
				'https://wp.tributestream.com/wp-json/tributestream/v1/user-cap',
				{
					method: 'GET',
					headers: {
						// Provide the token as a Bearer token in the Authorization header
						Authorization: `Bearer ${wpAuthData.token}`
					}
				}
			);

			console.log('🛬 [Auth API] Received response from custom plugin endpoint:');
			console.log('   Status Code:', rolesCapResponse.status);

			// Parse response from the plugin endpoint
			const rolesCapData: RolesCapabilitiesResponse = await rolesCapResponse.json();
			console.log('📝 [Auth API] Parsed response JSON from custom plugin endpoint:');
			console.log('   Response Data:', JSON.stringify(rolesCapData, null, 2));

			if (rolesCapResponse.ok && rolesCapData.roles && rolesCapData.capabilities) {
				roles = rolesCapData.roles;
				capabilities = rolesCapData.capabilities;
                user_id = rolesCapData.user_id;
			} else {
				console.error('❌ [Auth API] Failed to retrieve roles or capabilities from custom plugin.');
				// In production, you might decide how to handle this case gracefully.
				// For now, we just leave `roles` and `capabilities` as empty if there's an issue.
			}
		} catch (error) {
			console.error('🚨 [Auth API] Error occurred while fetching roles/capabilities:', error);
			// Similarly handle the error; we'll just default roles/capabilities to empty for now.
		}
	} else {
		console.warn('⚠️ [Auth API] No token found in WordPress JWT response. Skipping roles/capabilities fetch.');
	}

	// -----------------------
	// Step 6: Return successful response to the client, including roles & capabilities
	// -----------------------
	console.log('✅ [Auth API] Authentication successful. Returning combined data to client...');
	return new Response(
		JSON.stringify({
			token: wpAuthData.token,
			user_display_name: wpAuthData.user_display_name,
			user_email: wpAuthData.user_email,
			user_nicename: wpAuthData.user_nicename,
			// Roles and capabilities from our custom plugin endpoint
			roles: roles,
			capabilities: capabilities,
            user_id: user_id,
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
}
