import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get JWT token from cookie
  const token = event.cookies.get('jwt_token');

  if (token) {
    // Store token and authentication state in locals
    event.locals.token = token;
    event.locals.isAuthenticated = true;
    
    // Create new headers with Authorization
    const headers = new Headers(event.request.headers);
    headers.set('Authorization', `Bearer ${token}`);

    // Create a new request with the updated headers
    const request = new Request(
      event.request.url,
      {
        method: event.request.method,
        headers,
        body: event.request.body
      }
    );

    // Update the event request
    event.request = request;
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
