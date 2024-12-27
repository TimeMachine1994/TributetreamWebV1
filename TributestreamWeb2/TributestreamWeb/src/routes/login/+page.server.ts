// FILE: src/routes/login/+page.server.ts
// LANGUAGE: TypeScript

/**
 * +page.server.ts
 *
 * This file defines server-side logic for the SvelteKit application,
 * specifically handling user login and JWT token assignment via cookies.
 * 
 * NOTE: This version includes extensive console logging for debugging purposes.
 */

import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Importing the base URL of the WordPress site from environment variables
// Make sure you set BASE_WORDPRESS_API in your .env file or hosting platform
import { BASE_WORDPRESS_API } from '$env/static/private';

/**
 * handleLogin
 *
 * Sends a POST request to the WordPress JWT Authentication endpoint.
 * The function returns the raw `Response` object for further handling.
 *
 * @param username - The WordPress username
 * @param password - The WordPress password
 * @returns Promise<Response> - The fetch response from the WP JWT endpoint
 */
async function handleLogin(username: string, password: string) {
  console.log('[handleLogin] Invoked with:');
  console.log('  username:', username);
  console.log('  password:', password);

  let response: Response;

  try {
    console.log('[handleLogin] Fetching:', `${BASE_WORDPRESS_API}/jwt-auth/v1/token`);
    response = await fetch(`${BASE_WORDPRESS_API}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    console.log(`[handleLogin] Response Status: ${response.status}`);
  } catch (err) {
    console.error('[handleLogin] Fetch request failed with error:', err);
    throw new Error(`handleLogin error: ${err}`);
  }

  return response;
}

/**
 * load (PageServerLoad)
 *
 * This function runs on the server for each page request. If the user
 * is already logged in (i.e., the 'jwt' cookie is set), we redirect
 * them to the dashboard. Otherwise, we return an object with user: null.
 */
export const load: PageServerLoad = async ({ cookies }) => {
  console.log('[load] Checking for existing JWT cookie...');
  const token = cookies.get('jwt');

  if (token) {
    console.log('[load] JWT cookie found. Redirecting to /dashboard.');
    throw redirect(302, '/dashboard');
  }

  console.log('[load] No JWT cookie found. Returning user: null.');
  return { user: null };
};

/**
 * actions (Actions)
 *
 * SvelteKit’s form actions for this route. We define a single action
 * named 'login' to handle the login form submission.
 */
export const actions = {
  /**
   * login action
   *
   * Processes the username/password from the form submission, calls handleLogin,
   * sets a JWT cookie if successful, and redirects the user.
   */
  login: async ({ cookies, request }) => {
    console.log('[actions.login] Invoked');
    let username = '';
    let password = '';

    try {
      console.log('[actions.login] Reading formData...');
      const data = await request.formData();

      username = data.get('username')?.toString() || '';
      password = data.get('password')?.toString() || '';

      console.log('[actions.login] Extracted form data:');
      console.log('  username:', username);
      console.log('  password:', password);
    } catch (err) {
      console.error('[actions.login] Failed to parse formData:', err);
      return fail(400, {
        parseError: true,
        message: 'Could not parse the login form data'
      });
    }

    if (!username || !password) {
      console.warn('[actions.login] Missing username or password');
      return fail(400, {
        missing: true,
        message: 'Both username and password are required'
      });
    }

    let response: Response;
    try {
      console.log('[actions.login] Calling handleLogin()...');
      response = await handleLogin(username, password);
    } catch (err) {
      console.error('[actions.login] handleLogin threw an error:', err);
      return fail(500, {
        serverError: true,
        message: 'Failed to reach the authentication server. Please try again.'
      });
    }

    // If the response is not OK, then we fail
    if (!response.ok) {
      console.warn(`[actions.login] Auth failed with status ${response.status}`);
      let errorData: any;

      try {
        errorData = await response.json();
      } catch (err) {
        console.error('[actions.login] Failed to parse error JSON:', err);
        errorData = { message: 'Unknown error' };
      }

      return fail(response.status, {
        incorrect: true,
        message: errorData?.message || 'Invalid credentials'
      });
    }

    // If the response is OK, parse the JSON to get the token
    let responseData: any;
    try {
      console.log('[actions.login] Response is OK. Parsing JSON...');
      responseData = await response.json();
      console.log('[actions.login] Received responseData:', responseData);
    } catch (err) {
      console.error('[actions.login] Failed to parse success JSON:', err);
      return fail(500, {
        parseError: true,
        message: 'Could not parse the authentication response.'
      });
    }

    // Set the JWT token in a cookie
    try {
      console.log('[actions.login] Setting JWT cookie...');
      cookies.set('jwt', responseData.token, {
        path: '/',        // Cookie will be accessible site-wide
        httpOnly: false,   // Mitigates XSS (no client-side JS can read it)
        sameSite: 'none' // Helps prevent CSRF
        // secure: true    // Uncomment if your site is HTTPS
      });
      console.log('[actions.login] JWT cookie set successfully.');
    } catch (err) {
      console.error('[actions.login] Failed to set JWT cookie:', err);
      return fail(500, {
        cookieError: true,
        message: 'Could not set authentication cookie.'
      });
    }

    // Redirect to the dashboard
    console.log('[actions.login] Redirecting to /dashboard after successful login.');
    throw redirect(303, '/dashboard');
  }
} satisfies Actions;
