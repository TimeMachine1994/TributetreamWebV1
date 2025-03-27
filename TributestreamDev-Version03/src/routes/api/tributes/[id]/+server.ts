/**
 * Single Tribute Endpoint
 * 
 * Handles operations on a specific tribute by ID:
 * - GET: Retrieve a specific tribute
 * - PUT: Update a tribute
 * - DELETE: Delete a tribute
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  TRIBUTESTREAM_API_PATH
} from '$lib/server/apiUtils';
import { 
  getAuthenticatedUserId,
  checkTributePermission
} from '$lib/server/authUtils';
import type { 
  Tribute, 
  UpdateTributeParams, 
  UpdateTributeResponse,
  DeleteTributeResponse
} from '$lib/server/types';

/**
 * Handle GET requests to retrieve a specific tribute
 */
export async function GET(event: RequestEvent) {
  try {
    const { params } = event;
    
    if (!params.id) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID is required',
          400
        ),
        { status: 400 }
      );
    }
    
    const tributeId = parseInt(params.id, 10);
    
    // Validate the tribute ID
    if (isNaN(tributeId) || tributeId <= 0) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID must be a positive integer',
          400
        ),
        { status: 400 }
      );
    }
    
    // Try to authenticate the user
    let isAuthenticated = false;
    try {
      await getAuthenticatedUserId(event);
      isAuthenticated = true;
    } catch {
      // Silently ignore authentication failures,
      // will limit response data accordingly
    }
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<Tribute>(
      event,
      `${TRIBUTESTREAM_API_PATH}/tributes/${tributeId}`
    );
    
    // If the request failed, return the error
    if (!response.success) {
      return json(response, { status: response.status });
    }
    
    // If user is not authenticated, limit the data returned
    if (!isAuthenticated && response.data) {
      // Remove sensitive fields for unauthenticated users
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, phone_number, extended_data, ...publicData } = response.data;
      response.data = publicData as Tribute;
    }
    
    // Return the tribute data
    return json(response, { status: 200 });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error retrieving tribute:', error);
    
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
 * Handle PUT requests to update a tribute
 */
export async function PUT(event: RequestEvent) {
  try {
    const { params } = event;
    
    if (!params.id) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID is required',
          400
        ),
        { status: 400 }
      );
    }
    
    const tributeId = parseInt(params.id, 10);
    
    // Validate the tribute ID
    if (isNaN(tributeId) || tributeId <= 0) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID must be a positive integer',
          400
        ),
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let userId: number;
    try {
      userId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check permission to update this tribute
    const hasPermission = await checkTributePermission(event, tributeId, userId);
    if (!hasPermission) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You do not have permission to update this tribute',
          403
        ),
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await event.request.json() as UpdateTributeParams;
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<UpdateTributeResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/tributes/${tributeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      }
    );
    
    // Return the response
    return json(response, { status: response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error updating tribute:', error);
    
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
 * Handle DELETE requests to remove a tribute
 */
export async function DELETE(event: RequestEvent) {
  try {
    const { params } = event;
    
    if (!params.id) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID is required',
          400
        ),
        { status: 400 }
      );
    }
    
    const tributeId = parseInt(params.id, 10);
    
    // Validate the tribute ID
    if (isNaN(tributeId) || tributeId <= 0) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Tribute ID must be a positive integer',
          400
        ),
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let userId: number;
    try {
      userId = await getAuthenticatedUserId(event);
    } catch (error) {
      // Return the error response from getAuthenticatedUserId
      return error as Response;
    }
    
    // Check permission to delete this tribute
    const hasPermission = await checkTributePermission(event, tributeId, userId);
    if (!hasPermission) {
      return json(
        createErrorResponse(
          'PERMISSION_ERROR',
          'You do not have permission to delete this tribute',
          403
        ),
        { status: 403 }
      );
    }
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<DeleteTributeResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/tributes/${tributeId}`,
      { method: 'DELETE' }
    );
    
    // Return the response
    return json(response, { status: response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error deleting tribute:', error);
    
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