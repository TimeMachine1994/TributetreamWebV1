/**
 * Role check API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatResponse,
  ensureAuthenticated,
  ensureAuthenticatedUser
} from '../../utils';
import { createWpApiClient } from '../../utils/wp-api-client';
import type { RoleCheckRequest, RoleCheckResponse } from '../../types/roles';

/**
 * POST handler for checking user roles
 * 
 * @route POST /api/v2/roles/check
 * @param request The request object
 * @returns Response with role check result
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Parse request body
    const data = await request.json() as RoleCheckRequest;
    
    // Get user ID to check (default to current user)
    const userId = data.userId || user.id;
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get(`wp/v2/users/${userId}/roles`);
    
    // Check if user has the specified role
    let hasRole = undefined;
    if (data.role) {
      hasRole = userRoles.roles.includes(data.role);
    }
    
    // Check if user has the specified capability
    let hasCapability = undefined;
    if (data.capability) {
      hasCapability = !!userRoles.capabilities[data.capability];
    }
    
    // Return response
    return formatResponse<RoleCheckResponse['data']>({
      hasRole,
      hasCapability,
      roles: userRoles.roles,
      capabilities: Object.keys(userRoles.capabilities).filter(cap => userRoles.capabilities[cap])
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * GET handler for checking current user roles
 * 
 * @route GET /api/v2/roles/check
 * @param request The request object
 * @returns Response with user roles
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Get role and capability from query parameters
    const role = url.searchParams.get('role');
    const capability = url.searchParams.get('capability');
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get(`wp/v2/users/${user.id}/roles`);
    
    // Check if user has the specified role
    let hasRole = undefined;
    if (role) {
      hasRole = userRoles.roles.includes(role);
    }
    
    // Check if user has the specified capability
    let hasCapability = undefined;
    if (capability) {
      hasCapability = !!userRoles.capabilities[capability];
    }
    
    // Return response
    return formatResponse<RoleCheckResponse['data']>({
      hasRole,
      hasCapability,
      roles: userRoles.roles,
      capabilities: Object.keys(userRoles.capabilities).filter(cap => userRoles.capabilities[cap])
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};