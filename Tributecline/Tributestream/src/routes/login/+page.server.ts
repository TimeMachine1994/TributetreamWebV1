import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateToken } from '$lib/utils/security';

/**
 * Fetches a user's calculator status by hitting our /api endpoint
 * rather than making a direct call to WordPress.
 */
async function getCalculatorStatus(fetch: any, token: string) {
  try {
    const response = await fetch('/api/user-meta', {
      headers: {
        Authorization: `Bearer ${token}`
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

export const load: PageServerLoad = async ({ locals, fetch }) => {
  const token = locals.token;

  if (token) {
    try {
      // Validate token (make sure `validateToken` itself hits /api/validate-token internally
      // or you can remove this function and replace it with an /api call here).
      const isValid = await validateToken(token, { fetch } as any);

      if (isValid) {
        // Validate token again by hitting /api/validate-token endpoint
        // (optional if validateToken already does exactly this)
        const response = await fetch('/api/validate-token', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Fetch user info from /api/users/me
          const roleResponse = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (roleResponse.ok) {
            const userData = await roleResponse.json();
            const role = userData.roles?.length ? userData.roles[0] : 'subscriber';

            // For subscribers, check calculator status
            if (role === 'subscriber') {
              const hasCompletedCalculator = await getCalculatorStatus(fetch, token);

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
        throw error; // Re-throw the redirect
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
      /**
       * 1. Hit our /api/login endpoint to authenticate. That endpoint
       *    then communicates with WordPress or your backend as needed.
       */
      const response = await fetch('/api/login', {
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

      // 2. Validate token (optional if your /api/login already does this):
      const isValid = await validateToken(result.token, event);

      if (!isValid) {
        return fail(401, {
          error: { message: 'Invalid token received' }
        });
      }

      // 3. Store the token in an HTTP-only cookie
      cookies.set('auth_token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      /**
       * 4. Get user role (via /api/users/me). 
       *    Your /api/users/me route would proxy the call to WordPress
       *    `/wp-json/wp/v2/users/me`.
       */
      const roleResponse = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${result.token}`
        }
      });

      if (!roleResponse.ok) {
        return fail(roleResponse.status, {
          error: { message: 'Failed to get user role' }
        });
      }

      const userData = await roleResponse.json();
      const role = userData.roles?.length ? userData.roles[0] : 'subscriber';

      /**
       * 5. For subscribers, check calculator status.
       *    (Again, we're using our local helper that calls /api/user-meta.)
       */
      if (role === 'subscriber') {
        const hasCompletedCalculator = await getCalculatorStatus(fetch, result.token);

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

      /**
       * 6. Return user data and the correct redirect path for the front-end 
       *    to handle (e.g. svelte:page or +page.svelte can use "redirectTo").
       */
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