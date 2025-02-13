import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateToken } from '$lib/utils/security';

// Helper function to ensure consistent URL handling
function getWordPressUrl(): string {
  const url = process.env.WORDPRESS_URL;
  if (!url) {
    throw new Error('WORDPRESS_URL environment variable is not set');
  }
  return url.replace(/\/$/, ''); // Remove trailing slash if present
}

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
  // If user is already logged in, redirect to appropriate dashboard
  const token = locals.token;
  if (token) {
    try {
      const isValid = await validateToken(token, { fetch } as any);
      if (isValid) {
        // Get user role
        const wordpressUrl = getWordPressUrl();
        const roleResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
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
    } catch (error) {
      if (error instanceof Error && error.message === 'WORDPRESS_URL environment variable is not set') {
        console.error(error.message);
        return {
          error: { message: 'System configuration error. Please contact support.' }
        };
      }
      // If token validation fails, clear it and continue to login page
      locals.token = undefined;
    }
  }
};

export const actions: Actions = {
  login: async (event) => {
    const { request, fetch, cookies } = event;
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password) {
      return fail(400, {
        error: { message: 'Username and password are required' }
      });
    }

    try {
      const wordpressUrl = getWordPressUrl();

      // Authenticate with WordPress using event.fetch
      const response = await fetch(`${wordpressUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        return fail(500, {
          error: { message: 'Invalid response from authentication server' }
        });
      }

      if (!response.ok) {
        return fail(response.status, {
          error: { message: result.message || 'Authentication failed' }
        });
      }

      // Validate token using event.fetch
      const isValid = await validateToken(result.token, event);
      
      if (!isValid) {
        return fail(401, {
          error: { message: 'Invalid token received' }
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
      const roleResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
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
      if (error instanceof Error && error.message === 'WORDPRESS_URL environment variable is not set') {
        return fail(500, {
          error: { message: 'System configuration error. Please contact support.' }
        });
      }
      return fail(500, {
        error: { message: 'An unexpected error occurred' }
      });
    }
  }
};