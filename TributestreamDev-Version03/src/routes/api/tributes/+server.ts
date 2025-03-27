/**
 * Tributes Endpoint
 * 
 * Handles listing all tributes and creating new ones.
 * 
 * GET /api/tributes - List tributes with pagination and search
 * POST /api/tributes - Create a new tribute
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  TRIBUTESTREAM_API_PATH,
  buildQueryString
} from '$lib/server/apiUtils';
import { 
  getAuthenticatedUserId 
} from '$lib/server/authUtils';
import type { 
  CreateTributeParams, 
  PaginatedTributesResponse, 
  CreateTributeResponse
} from '$lib/server/types';

/**
 * Handle GET requests to list tributes
 */
export async function GET(event: RequestEvent) {
  try {
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
    };
    
    if (search) {
      queryParams.search = search;
    }
    
    // Forward to WordPress API
    const queryString = buildQueryString(queryParams);
    const response = await forwardRequestToWordPress<PaginatedTributesResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/tributes${queryString ? `?${queryString}` : ''}`
    );
    
    // Return the response
    return json(response, { status: response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error listing tributes:', error);
    
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

/**
 * Handle POST requests to create a new tribute
 */
export async function POST(event: RequestEvent) {
  try {
    // Authenticate the user
    let userId: number;
    
    try {
      userId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Parse the request body
    const body = await event.request.json() as CreateTributeParams;
    
    // Validate the request
    if (!body.loved_one_name) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Loved one name is required',
          400
        ),
        { status: 400 }
      );
    }
    
    if (!body.phone_number) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Phone number is required',
          400
        ),
        { status: 400 }
      );
    }
    
    // Ensure the user ID in the request matches the authenticated user
    if (body.user_id && body.user_id !== userId) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You are not authorized to create a tribute for another user',
          403
        ),
        { status: 403 }
      );
    }
    
    // Set the user ID from authentication if not provided
    if (!body.user_id) {
      body.user_id = userId;
    }
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<CreateTributeResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/tributes`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
    
    // Return the response
    return json(response, { status: response.success ? 201 : response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error creating tribute:', error);
    
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