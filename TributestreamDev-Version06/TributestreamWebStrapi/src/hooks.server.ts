import type { Handle } from '@sveltejs/kit';
import strapiClient from '$lib/api/strapi-client';

/**
 * SvelteKit server hook for handling requests
 * This hook handles authentication by checking for JWT tokens in cookies
 */
export const handle: Handle = async ({ event, resolve }) => {
  // Get JWT from cookies
  const jwt = event.cookies.get('jwt');

  if (jwt) {
    try {
      // Set the token in the Strapi client
      strapiClient.setToken(jwt);

      // Get current user from Strapi
      const userResponse = await strapiClient.getMe();
      
      // Add user to locals for access in load functions and server-side code
      if (userResponse && userResponse.data) {
        event.locals.user = userResponse.data;
        event.locals.jwt = jwt;
      }
    } catch (error) {
      console.error('Auth error in hooks:', error);
      
      // If token is invalid or expired, clear it
      event.cookies.set('jwt', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });
      
      // Clear the token from the client
      strapiClient.setToken(null);
      
      // Clear user from locals
      event.locals.user = null;
      event.locals.jwt = null;
    }
  } else {
    // No JWT token, ensure user is null
    event.locals.user = null;
    event.locals.jwt = null;
  }

  // Check if trying to access protected routes
  if (event.url.pathname.startsWith('/protected') && !event.locals.user) {
    // Redirect to login page if not authenticated
    return Response.redirect(`${event.url.origin}/login?redirectTo=${event.url.pathname}`, 302);
  }

  // Resolve the request
  return resolve(event);
};

// Ensure TypeScript knows about our additions to the locals object
declare global {
  namespace App {
    interface Locals {
      user: any;
      jwt: string | null;
    }
  }
}
