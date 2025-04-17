/**
 * User by ID API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatResponse,
  formatUpdatedResponse,
  formatDeletedResponse,
  ensureAuthenticatedUser,
  ensureIsAdmin,
  createWpApiClient
} from '../../utils';
import { 
  validateEmail, 
  validatePassword
} from '../../utils/validation';
import type { 
  User, 
  UserUpdateRequest, 
  UserResponse 
} from '../../types/users';
import { getRoleForUserType } from '../../utils/auth-utils';

/**
 * GET handler for retrieving a user by ID
 * 
 * @route GET /api/v2/users/:id
 * @param request The request object
 * @returns Response with user data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated and is an admin
  const { user, token } = ensureAuthenticatedUser(cookies);
  ensureIsAdmin(user);
  
  // Get user ID from params
  const userId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get user data from WordPress API
  const userData = await wpClient.get<Record<string, unknown>>(`wp/v2/users/${userId}`);
  
  // Get user roles and capabilities
  const userRoles = await wpClient.get<{
    roles?: string[];
    capabilities?: Record<string, boolean>;
    user_type?: string;
  }>(`wp/v2/users/${userId}/roles`);
  
  // Format user data
  const formattedUser: User = {
    id: Number(userData.id),
    username: String(userData.username || userData.slug || ''),
    email: String(userData.email || ''),
    name: String(userData.name || ''),
    display_name: String(userData.name || ''),
    first_name: String(userData.first_name || ''),
    last_name: String(userData.last_name || ''),
    roles: userRoles.roles || [],
    capabilities: userRoles.capabilities || {},
    user_type: userRoles.user_type || 'guest',
    registered_date: String(userData.registered_date || '')
  };
  
  // Return response
  return formatResponse<UserResponse['data']>(formattedUser);
};

/**
 * PUT handler for updating a user by ID
 * 
 * @route PUT /api/v2/users/:id
 * @param request The request object
 * @returns Response with updated user data
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  // Ensure user is authenticated and is an admin
  const { user, token } = ensureAuthenticatedUser(cookies);
  ensureIsAdmin(user);
  
  // Get user ID from params
  const userId = params.id;
  
  // Parse request body
  const data: UserUpdateRequest = await request.json();
  
  // Validate email if provided
  if (data.email) {
    validateEmail(data.email);
  }
  
  // Validate password if provided
  if (data.password) {
    validatePassword(data.password);
  }
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Prepare update data
  const updateData: Record<string, unknown> = {};
  
  // Only include fields that are provided
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (data.first_name) updateData.first_name = data.first_name;
  if (data.last_name) updateData.last_name = data.last_name;
  if (data.password) updateData.password = data.password;
  
  // Update user in WordPress
  const updatedUser = await wpClient.put<Record<string, unknown>>(`wp/v2/users/${userId}`, updateData);
  
  // Update role if provided
  if (data.role || data.user_type) {
    const role = data.role || (data.user_type ? getRoleForUserType(data.user_type) : null);
    if (role) {
      await wpClient.put(`wp/v2/users/${userId}/roles`, { roles: [role] });
    }
  }
  
  // Get user roles and capabilities
  const userRoles = await wpClient.get<{
    roles?: string[];
    capabilities?: Record<string, boolean>;
    user_type?: string;
  }>(`wp/v2/users/${userId}/roles`);
  
  // Format user data
  const formattedUser: User = {
    id: Number(updatedUser.id),
    username: String(updatedUser.username || updatedUser.slug || ''),
    email: String(updatedUser.email || ''),
    name: String(updatedUser.name || ''),
    display_name: String(updatedUser.name || ''),
    first_name: String(updatedUser.first_name || ''),
    last_name: String(updatedUser.last_name || ''),
    roles: userRoles.roles || [],
    capabilities: userRoles.capabilities || {},
    user_type: userRoles.user_type || 'guest',
    registered_date: String(updatedUser.registered_date || '')
  };
  
  // Return updated response
  return formatUpdatedResponse<UserResponse['data']>(formattedUser, 'User');
};

/**
 * DELETE handler for deleting a user by ID
 * 
 * @route DELETE /api/v2/users/:id
 * @param request The request object
 * @returns Response with deleted user ID
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated and is an admin
  const { user, token } = ensureAuthenticatedUser(cookies);
  ensureIsAdmin(user);
  
  // Get user ID from params
  const userId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Delete user in WordPress
  await wpClient.delete(`wp/v2/users/${userId}?force=true`);
  
  // Return deleted response
  return formatDeletedResponse(userId, 'User');
};
