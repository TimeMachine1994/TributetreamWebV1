/**
 * Logout API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import { formatResponse } from '../../utils';

/**
 * POST handler for user logout
 * 
 * @route POST /api/v2/auth/logout
 * @param request The request object
 * @returns Response with logout status
 */
export const POST: RequestHandler = async ({ cookies }) => {
  // Clear JWT token cookie
  cookies.delete('jwt_token', { path: '/' });
  
  // Clear user data cookie
  cookies.delete('user', { path: '/' });
  
  // Return success response
  return formatResponse({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * GET handler for user logout (for browser navigation)
 * 
 * @route GET /api/v2/auth/logout
 * @param request The request object
 * @returns Response with logout status
 */
export const GET: RequestHandler = async ({ cookies }) => {
  // Clear JWT token cookie
  cookies.delete('jwt_token', { path: '/' });
  
  // Clear user data cookie
  cookies.delete('user', { path: '/' });
  
  // Return success response
  return formatResponse({
    success: true,
    message: 'Logged out successfully'
  });
};