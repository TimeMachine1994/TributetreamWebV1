import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST handler for user logout
 * Clears authentication cookies
 */
export const POST: RequestHandler = async ({ cookies }) => {
  // Clear JWT token cookie with appropriate options
  cookies.delete('jwt_token', { 
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  });
  
  // Clear user data cookie
  cookies.delete('user', { 
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  });
  
  // Return success response
  return json({
    success: true,
    message: 'Successfully logged out'
  }, {
    headers: {
      'Cache-Control': 'no-store',
      'Location': '/my-portal'
    },
    status: 303 // See Other - redirect to the login page
  });
};