import type { Handle } from '@sveltejs/kit';
import { JWT_AUTH_URL } from '$lib/utils/env';

/**
 * SvelteKit server hook for handling authentication
 * 
 * This hook checks if the user is authenticated before allowing access to protected routes.
 */
export const handle: Handle = async ({ event, resolve }) => {
  // Get the JWT token from the cookie
  const token = event.cookies.get('wp_jwt_token');
  
  // Check if the route is protected
  const isProtectedRoute = event.url.pathname.startsWith('/(protected)');
  
  // If the route is protected and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/login?redirectTo=' + encodeURIComponent(event.url.pathname)
      }
    });
  }
  
  // If there's a token, validate it
  if (token) {
    try {
      // Make the validation request to the WordPress REST API using SvelteKit's event.fetch
      const response = await event.fetch(`${JWT_AUTH_URL}/token/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If the token is invalid and the route is protected, redirect to login
      if (!response.ok && isProtectedRoute) {
        // Clear the invalid token
        event.cookies.delete('wp_jwt_token', {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'strict'
        });
        
        return new Response(null, {
          status: 303,
          headers: {
            Location: '/login?redirectTo=' + encodeURIComponent(event.url.pathname)
          }
        });
      }
      
      // If the token is valid, set the user in the locals object
      if (response.ok) {
        // Parse the user data from the token (you might need to decode the JWT)
        // For now, we'll just set a flag indicating the user is authenticated
        event.locals.user = { isAuthenticated: true };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      
      // If there's an error and the route is protected, redirect to login
      if (isProtectedRoute) {
        return new Response(null, {
          status: 303,
          headers: {
            Location: '/login?redirectTo=' + encodeURIComponent(event.url.pathname)
          }
        });
      }
    }
  }
  
  // Continue with the request
  return resolve(event);
};
