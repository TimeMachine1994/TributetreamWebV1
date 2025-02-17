import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get JWT token from cookie
  const token = event.cookies.get('jwt_token');

  if (token) {
    // Store token and authentication state in locals
    event.locals.token = token;
    event.locals.isAuthenticated = true;
    
    // Add Authorization header to the existing request
    event.request.headers.set('Authorization', `Bearer ${token}`);
  } else {
    // Reset authentication state if no token
    event.locals.isAuthenticated = false;
    event.locals.token = undefined;
    event.locals.user = undefined;
  }

  // Resolve the request
  const response = await resolve(event);
  return response;
};
