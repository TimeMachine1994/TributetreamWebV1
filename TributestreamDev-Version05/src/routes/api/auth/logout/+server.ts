import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Logout handler
 * 
 * This endpoint clears the JWT token cookie.
 */
export const POST: RequestHandler = async ({ cookies }) => {
  // Clear the JWT token cookie
  cookies.delete('wp_jwt_token', {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict'
  });
  
  return json({
    success: true,
    message: 'Logged out successfully'
  });
};