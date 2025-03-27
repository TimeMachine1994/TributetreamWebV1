/**
 * User Metadata API Endpoint
 * 
 * Handles operations related to user metadata.
 * 
 * GET /api/users/[userId]/meta - Get all metadata for a user
 * GET /api/users/[userId]/meta/[key] - Get a specific metadata key for a user
 * POST /api/users/[userId]/meta - Create or update user metadata
 * DELETE /api/users/[userId]/meta/[key] - Delete user metadata
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  TRIBUTESTREAM_API_PATH,
  getNumberParam
} from '$lib/server/apiUtils';
import { 
  getAuthenticatedUserId 
} from '$lib/server/authUtils';
import type { 
  UserMetaResponse,
  UserMetaSingleResponse,
  CreateOrUpdateUserMetaParams,
  SuccessResponse
} from '$lib/server/types';

/**
 * Handle GET requests to retrieve user metadata
 */
export async function GET(event: RequestEvent) {
  try {
    // Get the user ID from the URL
    const userId = parseInt(event.params.userId, 10);
    
    // Validate the user ID
    if (isNaN(userId) || userId < 1) {
      return json(
        createErrorResponse(
          'INVALID_USER_ID',
          'Invalid user ID',
          400
        ),
        { status: 400 }
      );
    }
    
    // Check for a specific metadata key in the URL
    const metaKey = event.url.pathname.split('/').pop();
    const isSpecificKey = metaKey && metaKey !== 'meta';
    
    // Authenticate the user
    let authenticatedUserId: number;
    
    try {
      authenticatedUserId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check if the authenticated user is requesting their own metadata
    if (authenticatedUserId !== userId) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You are not authorized to access this metadata',
          403
        ),
        { status: 403 }
      );
    }
    
    // Forward to WordPress API
    if (isSpecificKey) {
      // Get a specific metadata key
      const response = await forwardRequestToWordPress<UserMetaSingleResponse>(
        event,
        `${TRIBUTESTREAM_API_PATH}/user-meta/${userId}/${encodeURIComponent(metaKey)}`
      );
      
      return json(response, { status: response.status || 200 });
    } else {
      // Get all metadata for the user
      const response = await forwardRequestToWordPress<UserMetaResponse>(
        event,
        `${TRIBUTESTREAM_API_PATH}/user-meta/${userId}`
      );
      
      return json(response, { status: response.status || 200 });
    }
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error retrieving user metadata:', error);
    
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
 * Handle POST requests to create or update user metadata
 */
export async function POST(event: RequestEvent) {
  try {
    // Get the user ID from the URL
    const userId = parseInt(event.params.userId, 10);
    
    // Validate the user ID
    if (isNaN(userId) || userId < 1) {
      return json(
        createErrorResponse(
          'INVALID_USER_ID',
          'Invalid user ID',
          400
        ),
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let authenticatedUserId: number;
    
    try {
      authenticatedUserId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check if the authenticated user is updating their own metadata
    if (authenticatedUserId !== userId) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You are not authorized to update this metadata',
          403
        ),
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await event.request.json() as {
      meta_key: string;
      meta_value: unknown;
    };
    
    // Validate the request
    if (!body.meta_key) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Meta key is required',
          400
        ),
        { status: 400 }
      );
    }
    
    if (body.meta_value === undefined) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Meta value is required',
          400
        ),
        { status: 400 }
      );
    }
    
    // Prepare the payload for WordPress
    const payload: CreateOrUpdateUserMetaParams = {
      user_id: userId,
      meta_key: body.meta_key,
      meta_value: body.meta_value
    };
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<SuccessResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/user-meta`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    
    // Return the response
    return json(response, { status: response.status || 200 });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error updating user metadata:', error);
    
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
 * Handle DELETE requests to delete user metadata
 */
export async function DELETE(event: RequestEvent) {
  try {
    // Get the user ID from the URL
    const userId = parseInt(event.params.userId, 10);
    
    // Validate the user ID
    if (isNaN(userId) || userId < 1) {
      return json(
        createErrorResponse(
          'INVALID_USER_ID',
          'Invalid user ID',
          400
        ),
        { status: 400 }
      );
    }
    
    // Check for a metadata key in the URL
    const metaKey = event.url.pathname.split('/').pop();
    
    if (!metaKey || metaKey === 'meta') {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Meta key is required in the URL',
          400
        ),
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let authenticatedUserId: number;
    
    try {
      authenticatedUserId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check if the authenticated user is deleting their own metadata
    if (authenticatedUserId !== userId) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You are not authorized to delete this metadata',
          403
        ),
        { status: 403 }
      );
    }
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<SuccessResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/user-meta/${userId}/${encodeURIComponent(metaKey)}`,
      {
        method: 'DELETE'
      }
    );
    
    // Return the response
    return json(response, { status: response.status || 200 });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error deleting user metadata:', error);
    
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