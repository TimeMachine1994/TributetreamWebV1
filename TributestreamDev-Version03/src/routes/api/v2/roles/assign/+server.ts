/**
 * Role assignment API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatResponse,
  validateRequired,
  ensureAuthenticatedUser
} from '../../utils';
import { createWpApiClient } from '../../utils/wp-api-client';
import { isAdmin } from '../../utils/auth-utils';
import type { RoleAssignRequest, RoleAssignResponse } from '../../types/roles';

/**
 * POST handler for assigning roles to users
 * 
 * @route POST /api/v2/roles/assign
 * @param request The request object
 * @returns Response with role assignment result
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Ensure user is an admin
    if (!isAdmin(user)) {
      throw ApiErrors.forbidden('Only administrators can assign roles');
    }
    
    // Parse request body
    const data = await request.json() as RoleAssignRequest;
    
    // Validate required fields
    validateRequired(data, ['userId', 'role']);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Assign role to user
    const result = await wpClient.post(`wp/v2/users/${data.userId}/roles`, {
      role: data.role,
      user_type: data.userType
    });
    
    // Return response
    return formatResponse<RoleAssignResponse['data']>({
      userId: data.userId,
      role: data.role,
      message: `Role ${data.role} assigned successfully to user ${data.userId}`
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * PUT handler for updating user roles
 * 
 * @route PUT /api/v2/roles/assign
 * @param request The request object
 * @returns Response with role update result
 */
export const PUT: RequestHandler = async ({ request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Ensure user is an admin
    if (!isAdmin(user)) {
      throw ApiErrors.forbidden('Only administrators can update roles');
    }
    
    // Parse request body
    const data = await request.json() as RoleAssignRequest;
    
    // Validate required fields
    validateRequired(data, ['userId', 'role']);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Update user role
    const result = await wpClient.put(`wp/v2/users/${data.userId}/roles`, {
      role: data.role,
      user_type: data.userType
    });
    
    // Return response
    return formatResponse<RoleAssignResponse['data']>({
      userId: data.userId,
      role: data.role,
      message: `Role updated to ${data.role} for user ${data.userId}`
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * DELETE handler for removing user roles
 * 
 * @route DELETE /api/v2/roles/assign
 * @param request The request object
 * @returns Response with role removal result
 */
export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Ensure user is an admin
    if (!isAdmin(user)) {
      throw ApiErrors.forbidden('Only administrators can remove roles');
    }
    
    // Get user ID and role from query parameters
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');
    
    // Validate required parameters
    if (!userId || !role) {
      throw ApiErrors.badRequest('userId and role query parameters are required');
    }
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Remove role from user
    const result = await wpClient.delete(`wp/v2/users/${userId}/roles/${role}`);
    
    // Return response
    return formatResponse({
      userId: Number(userId),
      role,
      message: `Role ${role} removed from user ${userId}`
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};