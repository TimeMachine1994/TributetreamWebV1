/**
 * User Tributes Endpoint
 * 
 * Retrieves all tributes for a specific user
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated } from '$lib/server/authUtils';
import type { Tribute } from '$lib/server/types';

/**
 * @api {get} /api/users/:userId/tributes Get tributes by user
 * @apiName GetTributesByUser
 * @apiGroup Users
 * @apiDescription Retrieves all tributes for a specific user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Array} data.tributes List of user's tributes
 */
export const GET: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated
    const authenticatedUserId = await ensureAuthenticated(event);
    
    const userId = parseInt(event.params.userId, 10);
    
    if (isNaN(userId)) {
      return json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Check if user is accessing their own tributes or has permission
    // In a more advanced implementation, we would check if the authenticated user
    // has permissions to view other users' tributes (e.g., admin role)
    if (authenticatedUserId !== userId) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to view tributes for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ tributes: Tribute[] }>(
      event,
      `/tributestream/v1/tributes/by-user/${userId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 404) });
  } catch (error) {
    console.error('Error fetching user tributes:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch user tributes',
        status: 500
      }
    }, { status: 500 });
  }
};