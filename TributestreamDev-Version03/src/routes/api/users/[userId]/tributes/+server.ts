/**
 * User Tributes Endpoint
 * 
 * Handles retrieving tributes for a specific user.
 * 
 * GET /api/users/[userId]/tributes - Get tributes for a specific user
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  FUNERAL_API_PATH,
  buildQueryString
} from '$lib/server/apiUtils';
import { 
  getAuthenticatedUserId,
  isUserAdmin
} from '$lib/server/authUtils';
import type { PaginatedTributesResponse } from '$lib/server/types';

/**
 * Handle GET requests to retrieve tributes for a user
 */
export async function GET(event: RequestEvent) {
  try {
    const { params } = event;
    const userId = params.userId;
    
    if (!userId || isNaN(parseInt(userId, 10))) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid user ID',
          400
        ),
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let currentUserId: number;
    
    try {
      currentUserId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check if user is accessing their own data or is an admin
    const targetUserId = parseInt(userId, 10);
    const isAdmin = await isUserAdmin(currentUserId, event);
    
    if (currentUserId !== targetUserId && !isAdmin) {
      return json(
        createErrorResponse(
          'PERMISSION_DENIED',
          'You do not have permission to access tributes for this user',
          403
        ),
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(event.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const search = url.searchParams.get('search') || '';
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Page must be a positive integer',
          400
        ),
        { status: 400 }
      );
    }
    
    if (isNaN(perPage) || perPage < 1 || perPage > 100) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'perPage must be a positive integer between 1 and 100',
          400
        ),
        { status: 400 }
      );
    }
    
    // Build query parameters as a Record
    const queryParams: Record<string, string | number | boolean> = {
      page,
      per_page: perPage,
      user_id: targetUserId
    };
    
    if (search) {
      queryParams.search = search;
    }
    
    // Forward to WordPress API
    const queryString = buildQueryString(queryParams);
    const response = await forwardRequestToWordPress<PaginatedTributesResponse>(
      event,
      `${FUNERAL_API_PATH}/tribute-pages${queryString ? `?${queryString}` : ''}`
    );
    
    // Return the response
    return json(response, { status: response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error retrieving user tributes:', error);
    
    return json(
      createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      ),
      { status: 500 }
    );
  }
}