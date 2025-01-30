/**
 * This SvelteKit server hook handles:
 *   1. Reading cookies to retrieve JWT and user info (including roles/capabilities).
 *   2. Storing those values in `event.locals` so that server-side endpoints
 *      (or `load` functions) can read them without repeatedly parsing cookies.
 *   3. Applying route guards for admin-related paths by:
 *      - Redirecting /admin -> /admin-dashboard
 *      - Checking if the user is authenticated (has JWT) and if `userData.isAdmin` is true
 *   4. Logging useful debug statements for development.
 *
 * Note that in SvelteKit:
 *   - `event.cookies.get(...)` (and `getAll`) can read cookies.
 *   - `event.cookies.set(...)` can write or update cookies.
 *   - `event.locals` can carry data between hooks and server routes (APIs).
 */

import { redirect } from '@sveltejs/kit';

/**
 * The main handle function that SvelteKit calls for every request.
 */
export const handle = async ({ event, resolve }) => {
	console.log('🔄 [Hook] Intercepting Request:', event.url.pathname);

	// ----------------------------------------------------------------
	// 1. Read cookies
	// ----------------------------------------------------------------
	// For demonstration, let's log all cookies
	const cookies = event.cookies.getAll();
	console.log('🍪 [Hook] All cookies:', cookies);

	// Retrieve the JWT token from cookies (if it exists)
	const jwt = event.cookies.get('jwt');
	// Retrieve the user data cookie, which should contain roles, capabilities, etc. (if we set it after login)
	const userCookie = event.cookies.get('user');

	// ----------------------------------------------------------------
	// 2. Attach JWT to event.locals for convenience
	// ----------------------------------------------------------------
	event.locals.jwt = jwt;

	// ----------------------------------------------------------------
	// 3. Parse user data from cookie, if present
	// ----------------------------------------------------------------
	let userData = null;
	if (userCookie) {
		try {
			userData = JSON.parse(userCookie);

			/**
			 * If your client sets 'roles' or 'capabilities' in the user cookie,
			 * you can also optionally parse them here. For example:
			 *
			 *    userData.isAdmin = userData.roles?.includes('administrator');
			 *
			 * Then store in event.locals for easy server-side usage:
			 */
			if (Array.isArray(userData.roles)) {
				userData.isAdmin = userData.roles.includes('administrator');
			} else {
				userData.isAdmin = false;
			}

			// Store the entire user object in event.locals
			event.locals.user = userData;

			console.log('👤 [Hook] Parsed user data from cookie:', {
				displayName: userData.displayName,
				roles: userData.roles,
				isAdmin: userData.isAdmin
				// capabilities: userData.capabilities // if you need them
			});
		} catch (error) {
			console.error('❌ [Hook] Error parsing user cookie:', error);
		}
	} else {
		console.log('🚫 [Hook] No user cookie found.');
	}

	// ----------------------------------------------------------------
	// 4. Protect Admin Routes
	// ----------------------------------------------------------------
	if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/admin-dashboard')) {
		console.log('🔒 [Hook] Checking admin route access...');

		// Redirect /admin directly to /admin-dashboard
		if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
			console.log('↪️ [Hook] Redirecting /admin to /admin-dashboard');
			throw redirect(303, '/admin-dashboard');
		}

		// Make sure user is authenticated
		if (!jwt || !userData) {
			console.log('⚠️ [Hook] No authentication found, redirecting to /login');
			throw redirect(303, '/login');
		}

		// Verify they are an administrator
		if (!userData.isAdmin) {
			console.log('🚫 [Hook] User is not an admin, redirecting to /dashboard');
			throw redirect(303, '/dashboard');
		}

		console.log('✅ [Hook] Admin access granted');
	}

	// ----------------------------------------------------------------
	// 5. Resolve the request and return the response
	// ----------------------------------------------------------------
	const response = await resolve(event);
	console.log('✅ [Hook] Response Status:', response.status);

	return response;
};
