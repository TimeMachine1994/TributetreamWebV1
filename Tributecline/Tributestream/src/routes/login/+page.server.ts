import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/utils/api.server';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, '/family-dashboard');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      return fail(400, {
        error: 'Username and password are required',
        username: username?.toString() || ''
      });
    }

    try {
      const response = await authenticate(username.toString(), password.toString());

      // Set token in cookie
      cookies.set('jwt_token', response.token, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Update locals with authentication data
      locals.token = response.token;
      locals.isAuthenticated = true;
      locals.user = {
        email: response.user_email,
        displayName: response.user_display_name,
        nicename: response.user_nicename
      };

      return { success: true };
    } catch (error) {
      return fail(401, {
        error: 'Invalid credentials',
        username: username.toString()
      });
    }
  }
};