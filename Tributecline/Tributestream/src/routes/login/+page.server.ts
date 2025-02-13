import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateToken } from '$lib/utils/security';
import { WORDPRESS_URL } from '$env/static/public';
async function getCalculatorStatus(fetch: any, token: string) {
  try {
    const response = await fetch('/api/user-meta', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const calculatorStatus = data.meta_value ? JSON.parse(data.meta_value) : null;
    return calculatorStatus?.completed || false;
  } catch (error) {
    console.error('Error fetching calculator status:', error);
    return null;
  }
}

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
  // If user is already logged in, redirect to appropriate dashboard
  const token = locals.token;
  if (token) {
    try {
      const isValid = await validateToken(token, { fetch } as any);
      if (isValid) {
        // Get user role
        const response = await fetch(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const roleResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (roleResponse.ok) {
            const userData = await roleResponse.json();
            const role = userData.roles?.length ? userData.roles[0] : 'subscriber'; // Default to subscriber if no roles
            
            // For subscribers, check calculator status
            if (role === 'subscriber') {
              const hasCompletedCalculator = await getCalculatorStatus(fetch, token);
              
              // If calculator is not completed, redirect to calculator
              if (hasCompletedCalculator === false) {
                throw redirect(302, '/calculator');
              }
            }

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
      if (error instanceof Response && error.status === 302) {
        throw error; // Re-throw redirect responses
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
      // Authenticate with WordPress using event.fetch
      const response = await fetch(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
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
      const roleResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
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
      const role = userData.roles?.length ? userData.roles[0] : 'subscriber'; // Default to subscriber if no roles

      // For subscribers, check calculator status
      if (role === 'subscriber') {
        const hasCompletedCalculator = await getCalculatorStatus(fetch, result.token);
        
        // If calculator is not completed, redirect to calculator
        if (hasCompletedCalculator === false) {
          return {
            user: {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              displayName: userData.name,
              role
            },
            redirectTo: '/calculator'
          };
        }
      }

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