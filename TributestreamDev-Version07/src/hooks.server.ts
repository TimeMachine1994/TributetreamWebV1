import { getCurrentUser } from '$lib/api/auth';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Get JWT from cookies
  const token = event.cookies.get('auth_token');
  
  if (token) {
    try {
      // Verify and get user with their role
      const user = await getCurrentUser(token);
      
      // Store in event.locals for use in load functions
      event.locals.user = user;
      event.locals.token = token;
    } catch (err) {
      // Invalid or expired token
      event.cookies.delete('auth_token', { path: '/' });
    }
  }
  
  return resolve(event);
}
