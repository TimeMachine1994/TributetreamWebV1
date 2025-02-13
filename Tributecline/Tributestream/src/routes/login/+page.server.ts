import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateToken } from '$lib/utils/security';

export const load: PageServerLoad = async ({ locals }) => {
  // If user is already logged in, redirect to appropriate dashboard
  const token = locals.token;
  if (token) {
    try {
      const isValid = await validateToken(token);
      if (isValid) {
        // Get user role
        const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const roleResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (roleResponse.ok) {
            const userData = await roleResponse.json();
            const role = userData.roles[0]; // Get first role
            
            // Redirect based on role
            if (role === 'administrator') {
              throw redirect(302, '/admin-dashboard');
            } else {
              throw redirect(302, '/family-dashboard');
            }
          }
        }
      }
    } catch (error) {
      // If token validation fails, clear it and continue to login page
      locals.token = null;
    }
  }
};

export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password) {
      return fail(400, {
        error: { message: 'Username and password are required' }
      });
    }

    try {
      // Authenticate with WordPress
      const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
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
          error: { message: result.message || 'Authentication failed' }
        });
      }

      // Store the token in a secure HTTP-only cookie
      cookies.set('auth_token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // Get user role
      const roleResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${result.token}`
        }
      });

      if (!roleResponse.ok) {
        return fail(roleResponse.status, {
          error: { message: 'Failed to get user role' }
        });
      }

      const userData = await roleResponse.json();
      const role = userData.roles[0]; // Get first role

      // Return user data and redirect path based on role
      return {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          displayName: userData.name,
          role
        },
        redirectTo: role === 'administrator' ? '/admin-dashboard' : '/family-dashboard'
      };
    } catch (error) {
      console.error('Login error:', error);
      return fail(500, {
        error: { message: 'An unexpected error occurred' }
      });
    }
  }
};