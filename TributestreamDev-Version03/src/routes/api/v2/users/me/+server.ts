/**
 * Current user API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatResponse,
  ensureAuthenticatedUser
} from '../../utils';
import { createWpApiClient } from '../../utils/wp-api-client';
import type { UserResponse } from '../../types/users';

/**
 * GET handler for retrieving the current user
 * 
 * @route GET /api/v2/users/me
 * @param request The request object
 * @returns Response with current user data
 */
export const GET: RequestHandler = async ({ cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get detailed user data
    const userData = await wpClient.get(`wp/v2/users/${user.id}`);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get(`wp/v2/users/${user.id}/roles`);
    
    // Format user data
    const formattedUser = {
      id: userData.id,
      username: userData.username || userData.slug,
      email: userData.email,
      name: userData.name,
      display_name: userData.name,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      roles: userRoles.roles || [],
      capabilities: userRoles.capabilities || {},
      user_type: userRoles.user_type || 'guest',
      registered_date: userData.registered_date || ''
    };
    
    // Return response
    return formatResponse<UserResponse['data']>(formattedUser);
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * PATCH handler for updating the current user
 * 
 * @route PATCH /api/v2/users/me
 * @param request The request object
 * @returns Response with updated user data
 */
export const PATCH: RequestHandler = async ({ request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Parse request body
    const data = await request.json();
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    // Only allow updating certain fields
    if (data.email) updateData.email = data.email;
    if (data.first_name) updateData.first_name = data.first_name;
    if (data.last_name) updateData.last_name = data.last_name;
    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password = data.password;
    
    // Update user
    const updatedUser = await wpClient.put(`wp/v2/users/${user.id}`, updateData);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get(`wp/v2/users/${user.id}/roles`);
    
    // Format user data
    const formattedUser = {
      id: updatedUser.id,
      username: updatedUser.username || updatedUser.slug,
      email: updatedUser.email,
      name: updatedUser.name,
      display_name: updatedUser.name,
      first_name: updatedUser.first_name || '',
      last_name: updatedUser.last_name || '',
      roles: userRoles.roles || [],
      capabilities: userRoles.capabilities || {},
      user_type: userRoles.user_type || 'guest',
      registered_date: updatedUser.registered_date || ''
    };
    
    // Update user cookie with new data
    cookies.set('user', JSON.stringify({
      id: formattedUser.id,
      username: formattedUser.username,
      name: formattedUser.name,
      display_name: formattedUser.display_name,
      roles: formattedUser.roles,
      user_type: formattedUser.user_type
    }), {
      path: '/',
      httpOnly: false, // Allow JavaScript access to user data
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    // Return response
    return formatResponse<UserResponse['data']>(formattedUser);
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};