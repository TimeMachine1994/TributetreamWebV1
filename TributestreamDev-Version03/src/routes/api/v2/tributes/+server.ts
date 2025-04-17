/**
 * Tribute management API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatPaginatedResponse,
  ensureAuthenticatedUser,
  validatePagination
} from '../utils';
import { createWpApiClient } from '../utils/wp-api-client';
import type { Tribute, TributesListResponse, TributeListQueryParams } from '../types/tributes';
import { validateRequired } from '../utils/validation';
import { formatCreatedResponse } from '../utils/response-formatter';

/**
 * GET handler for retrieving a list of tributes
 * 
 * @route GET /api/v2/tributes
 * @param request The request object
 * @returns Response with list of tributes
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Parse query parameters
    const page = Number(url.searchParams.get('page') || '1');
    const per_page = Number(url.searchParams.get('per_page') || '10');
    const search = url.searchParams.get('search') || '';
    const user_id = url.searchParams.get('user_id') ? Number(url.searchParams.get('user_id')) : undefined;
    const sort_by = url.searchParams.get('sort_by') || 'loved_ones_name';
    const sort_order = url.searchParams.get('sort_order') || 'asc';
    
    // Validate pagination parameters
    validatePagination(page, per_page);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      search,
      orderby: sort_by,
      order: sort_order
    });
    
    // Add user_id filter if provided
    if (user_id) {
      queryParams.append('created_by_user_id', user_id.toString());
    }
    
    // Get tributes from WordPress
    const tributes = await wpClient.get(`tributestream/v1/tributes?${queryParams.toString()}`);
    const total = Number(tributes.headers?.get('X-WP-Total') || tributes.length);
    
    // Return paginated response
    return formatPaginatedResponse<Tribute[]>(
      tributes,
      total,
      page,
      per_page
    );
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * POST handler for creating a new tribute
 * 
 * @route POST /api/v2/tributes
 * @param request The request object
 * @returns Response with created tribute data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    validateRequired(data, ['loved_ones_name']);
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Prepare tribute data
    const tributeData = {
      created_by_user_id: user.id,
      point_of_contact_user_id: data.point_of_contact_user_id || user.id,
      loved_ones_name: data.loved_ones_name,
      slugified_name: data.slugified_name || data.loved_ones_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      page_html: data.page_html || '',
      loved_ones_dob: data.loved_ones_dob || '',
      loved_ones_dod: data.loved_ones_dod || ''
    };
    
    // Create tribute
    const createdTribute = await wpClient.post('tributestream/v1/tributes', tributeData);
    
    // Return created response
    return formatCreatedResponse<Tribute>(createdTribute, 'Tribute');
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};