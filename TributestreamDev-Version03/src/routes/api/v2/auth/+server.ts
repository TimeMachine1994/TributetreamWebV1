/**
 * Authentication API endpoint for the API v2
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatResponse, 
  validateRequired, 
  validateEmail 
} from '../utils';
import { createWpApiClient } from '../utils/wp-api-client';
import type { UserLoginRequest, UserLoginResponse } from '../types/users';

/**
 * POST handler for user login
 * 
 * @route POST /api/v2/auth
 * @param request The request object
 * @returns Response with user data and authentication token
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse request body
    const data = await request.json() as UserLoginRequest;
    
    // Validate required fields
    validateRequired(data, ['username', 'password']);
    
    // If username is an email, validate it
    if (data.username.includes('@')) {
      validateEmail(data.username);
    }
    
    // Create WordPress API client
    const wpClient = createWpApiClient();
    
    // Authenticate with WordPress
    const response = await wpClient.post<{
      token: string;
      user_email: string;
      user_nicename: string;
      user_display_name: string;
      user_id: number;
    }>('jwt-auth/v1/token', {
      username: data.username,
      password: data.password
    }, false);
    
    // Get user data
    const userData = await wpClient.get(`wp/v2/users/${response.user_id}`, false);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get(`wp/v2/users/${response.user_id}/roles`, false);
    
    // Format user data
    const user = {
      id: response.user_id,
      username: response.user_nicename,
      email: response.user_email,
      name: response.user_display_name,
      display_name: userData.name || response.user_display_name,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      roles: userRoles.roles || [],
      capabilities: userRoles.capabilities || {},
      user_type: userRoles.user_type || 'guest',
      registered_date: userData.registered_date || ''
    };
    
    // Set cookies if remember_me is true (default) or not specified
    const rememberMe = data.remember_me !== false;
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
    };
    
    // Set JWT token cookie
    cookies.set('jwt_token', response.token, cookieOptions);
    
    // Set user data cookie (non-sensitive data only)
    cookies.set('user', JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      display_name: user.display_name,
      roles: user.roles,
      user_type: user.user_type
    }), {
      path: '/',
      httpOnly: false, // Allow JavaScript access to user data
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
    });
    
    // Return success response
    return formatResponse<UserLoginResponse['data']>({
      user
    });
  } catch (error) {
    // Handle errors
    if (error instanceof Error && (error.message.includes('invalid_username') || error.message.includes('incorrect_password'))) {
      throw ApiErrors.unauthorized('Invalid username or password');
    }
    
    throw error;
  }
};

/**
 * GET handler for checking authentication status
 * 
 * @route GET /api/v2/auth
 * @param request The request object
 * @returns Response with authentication status
 */
export const GET: RequestHandler = async ({ cookies }) => {
  // Get JWT token from cookies
  const token = cookies.get('jwt_token');
  
  // Get user data from cookies
  const userCookie = cookies.get('user');
  let user = null;
  
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }
  
  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;
  
  // Return authentication status
  return formatResponse({
    isAuthenticated,
    user: isAuthenticated ? user : null
  });
};

/**
 * DELETE handler for user logout
 * 
 * @route DELETE /api/v2/auth
 * @param request The request object
 * @returns Response with logout status
 */
export const DELETE: RequestHandler = async ({ cookies }) => {
  // Clear JWT token cookie
  cookies.delete('jwt_token', { path: '/' });
  
  // Clear user data cookie
  cookies.delete('user', { path: '/' });
  
  // Return success response
  return formatResponse({
    message: 'Logged out successfully'
  });
};