import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dev } from '$app/environment';

export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    
    if (!username || !password) {
      return fail(400, {
        message: 'Username and password are required'
      });
    }
    
    try {
      // Call WordPress API to authenticate
      const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return fail(response.status, {
          message: result.message || 'Authentication failed'
        });
      }
      
      // Check if user has admin role
      if (!result.user_roles?.includes('administrator')) {
        return fail(403, {
          message: 'You do not have permission to access the admin area'
        });
      }
      
      // Set authentication cookies
      cookies.set('jwt_token', result.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      cookies.set('user', JSON.stringify({
        id: result.user_id,
        name: result.user_display_name,
        email: result.user_email
      }), {
        path: '/',
        httpOnly: false,
        sameSite: 'strict',
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      // Redirect to admin dashboard
      throw redirect(303, '/admin');
    } catch (error) {
      if (error instanceof Response) {
        throw error; // This is a redirect, let it pass through
      }
      
      console.error('Login error:', error);
      return fail(500, {
        message: 'An unexpected error occurred during login'
      });
    }
  }
};