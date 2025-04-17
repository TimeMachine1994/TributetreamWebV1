/**
 * Users API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  formatCreatedResponse,
  ensureAuthenticatedUser,
  ensureIsAdmin,
  createWpApiClient
} from '../utils';
import { 
  validateRequired, 
  validateEmail, 
  validatePassword,
  validatePagination
} from '../utils/validation';
import type { 
  User, 
  UserCreateRequest, 
  UsersListResponse, 
  UserResponse 
} from '../types/users';
import type { ListQueryParams } from '../types';
import { getRoleForUserType } from '../utils/auth-utils';

/**
 * GET handler for retrieving a list of users
 * 
 * @route GET /api/v2/users
 * @param request The request object
 * @returns Response with paginated list of users
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Ensure user is authenticated and is an admin
  const { user, token } = ensureAuthenticatedUser(cookies);
  ensureIsAdmin(user);
    
    // Parse query parameters
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('per_page') || '10');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort_by') || 'registered_date';
    const sortOrder = url.searchParams.get('sort_order') || 'desc';
    
    // Validate pagination parameters
    validatePagination(page, perPage);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Build query parameters
    const queryParams: ListQueryParams = {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc'
    };
    
    // Convert to URL search params
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    // Get users from WordPress API
    const usersResponse = await wpClient.get<{
      users: Record<string, unknown>[];
      total?: number;
      headers?: { 'X-WP-Total'?: string };
    }>(`wp/v2/users?${params.toString()}`);
    
    // Extract users array and total count
    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.users || []);
    const totalUsers = usersResponse.total || 
                       (usersResponse.headers && usersResponse.headers['X-WP-Total'] ? 
                        parseInt(usersResponse.headers['X-WP-Total'], 10) : 
                        users.length);
    
    // Format user data
    const formattedUsers: User[] = await Promise.all(
      users.map(async (userData: Record<string, unknown>) => {
        // Get user roles and capabilities
        const userRoles = await wpClient.get<{
          roles?: string[];
          capabilities?: Record<string, boolean>;
          user_type?: string;
        }>(`wp/v2/users/${userData.id}/roles`);
        
        return {
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
      })
    );
    
    // Return paginated response
    return formatPaginatedResponse<UsersListResponse['data']>(
      formattedUsers,
      totalUsers,
      page,
      perPage
    );
};

/**
 * POST handler for creating a new user
 * 
 * @route POST /api/v2/users
 * @param request The request object
 * @returns Response with created user data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Ensure user is authenticated and is an admin
  const { user, token } = ensureAuthenticatedUser(cookies);
  ensureIsAdmin(user);
    
    // Parse request body
    const data: UserCreateRequest = await request.json();
    
    // Validate required fields
    validateRequired(data, ['username', 'email', 'password']);
    
    // Validate email format
    validateEmail(data.email);
    
    // Validate password
    validatePassword(data.password);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Prepare create data
    const createData: Record<string, unknown> = {
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name || data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || ''
    };
    
    // Add role if provided
    if (data.role) {
      createData.roles = [data.role];
    } else if (data.user_type) {
      createData.roles = [getRoleForUserType(data.user_type)];
    }
    
    // Create user in WordPress
    const createdUser = await wpClient.post<Record<string, unknown>>('wp/v2/users', createData);
    
    // Get user roles and capabilities
    const userRoles = await wpClient.get<{
      roles?: string[];
      capabilities?: Record<string, boolean>;
      user_type?: string;
    }>(`wp/v2/users/${createdUser.id}/roles`);
    
    // Format user data
    const formattedUser: User = {
      id: Number(createdUser.id),
      username: String(createdUser.username || createdUser.slug || ''),
      email: String(createdUser.email || ''),
      name: String(createdUser.name || ''),
      display_name: String(createdUser.name || ''),
      first_name: String(createdUser.first_name || ''),
      last_name: String(createdUser.last_name || ''),
      roles: userRoles.roles || [],
      capabilities: userRoles.capabilities || {},
      user_type: userRoles.user_type || 'guest',
      registered_date: String(createdUser.registered_date || '')
    };
    
    // Return created response
    return formatCreatedResponse<UserResponse['data']>(formattedUser, 'User');
};
