import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/utils/api.server';
import { WordPressApiError } from '$lib/config/wordpress.server';
import type { Actions, PageServerLoad } from './$types';

/**
 * Server-side load function
 * Handles redirects for authenticated users and sets up initial page data
 */
export const load: PageServerLoad = async ({ locals, url }) => {
  // If user is already authenticated, redirect to dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }

  return {
    // Pass any URL parameters (like returnUrl) to the page
    returnUrl: url.searchParams.get('returnUrl') || '/dashboard'
  };
};

/**
 * Server-side form actions
 * Provides an alternative server-side authentication flow
 * This is useful for progressive enhancement and non-JS scenarios
 */
export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    // Validate form inputs
    if (!username || !password) {
      return fail(400, {
        error: 'Username and password are required',
        username: username?.toString() || ''
      });
    }

    try {
      // Attempt authentication
      const response = await authenticate(
        username.toString(),
        password.toString()
      );

      // Set secure HTTP-only cookie with the token
      cookies.set('jwt_token', response.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Fetch user data using the token
      const userResponse = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${response.token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();

      // Store the user ID in a cookie
      cookies.set('user_id', userData.id.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Return success data
      return {
        success: true,
        user: {
          email: response.user_email,
          displayName: response.user_display_name,
          nicename: response.user_nicename
        }
      };
    } catch (error) {
      // Handle WordPress API errors
      if (error instanceof WordPressApiError) {
        console.error('WordPress authentication error:', {
          code: error.code,
          message: error.message,
          status: error.status
        });

        return fail(error.status, {
          error: error.message,
          username: username.toString()
        });
      }

      // Handle unexpected errors
      console.error('Authentication error:', error);
      return fail(500, {
        error: 'An unexpected error occurred during authentication',
        username: username.toString()
      });
    }
  }
};