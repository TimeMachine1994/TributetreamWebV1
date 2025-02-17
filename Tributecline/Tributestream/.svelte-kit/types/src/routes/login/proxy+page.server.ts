// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

const WORDPRESS_URL = 'http://localhost:80/wp-json';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  if (locals.user) {
    throw redirect(302, '/family-dashboard');
  }
  return {};
};

export const actions = {
  default: async ({ request, cookies, locals }: import('./$types').RequestEvent) => {
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
      // Make request to WordPress JWT auth endpoint
      const response = await fetch(`${WORDPRESS_URL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: username.toString(), 
          password: password.toString() 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return fail(response.status, {
          error: errorData.message || 'Authentication failed',
          username: username.toString()
        });
      }

      const data = await response.json();

      // Set token in cookie
      cookies.set('jwt_token', data.token, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Update locals with authentication data
      locals.token = data.token;
      locals.isAuthenticated = true;
      locals.user = {
        email: data.user_email,
        displayName: data.user_display_name,
        nicename: data.user_nicename
      };

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return fail(401, {
        error: 'Invalid credentials',
        username: username.toString()
      });
    }
  }
};;null as any as Actions;