import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing authentication cookies
 */
export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // Clear authentication cookies
    cookies.delete('jwt_token', { path: '/' });
    cookies.delete('user', { path: '/' });
    
    return json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred during logout' 
    }, { status: 500 });
  }
};