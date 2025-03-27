/**
 * Individual User Metadata Endpoint
 * 
 * Handles operations on a specific metadata key for a user
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated } from '$lib/server/authUtils';

/**
 * @api {get} /api/users/:userId/meta/:metaKey Get user metadata by key
 * @apiName GetUserMetaSingle
 * @apiGroup Users
 * @apiDescription Retrieves a specific metadata entry for a user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 * @apiParam {String} metaKey Metadata key
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {String} data.key Metadata key
 * @apiSuccess {*} data.value Metadata value
 */
export const GET: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated
    const authenticatedUserId = await ensureAuthenticated(event);
    
    const userId = parseInt(event.params.userId, 10);
    const metaKey = event.params.metaKey;
    
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
    
    if (!metaKey) {
      return json({
        success: false,
        error: {
          code: 'MISSING_META_KEY',
          message: 'Metadata key is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Check if user is accessing their own metadata or has permission
    if (authenticatedUserId !== userId) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to view metadata for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ key: string; value: unknown }>(
      event,
      `/tributestream/v1/user-meta/${userId}/${encodeURIComponent(metaKey)}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 404) });
  } catch (error) {
    console.error('Error fetching user metadata:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch user metadata',
        status: 500
      }
    }, { status: 500 });
  }
};

/**
 * @api {delete} /api/users/:userId/meta/:metaKey Delete user metadata
 * @apiName DeleteUserMeta
 * @apiGroup Users
 * @apiDescription Deletes a specific metadata entry for a user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 * @apiParam {String} metaKey Metadata key
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Boolean} data.success Operation success status
 */
export const DELETE: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated
    const authenticatedUserId = await ensureAuthenticated(event);
    
    const userId = parseInt(event.params.userId, 10);
    const metaKey = event.params.metaKey;
    
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
    
    if (!metaKey) {
      return json({
        success: false,
        error: {
          code: 'MISSING_META_KEY',
          message: 'Metadata key is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Check if user is accessing their own metadata or has permission
    if (authenticatedUserId !== userId) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to delete metadata for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ success: boolean }>(
      event,
      `/tributestream/v1/user-meta/${userId}/${encodeURIComponent(metaKey)}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error deleting user metadata:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete user metadata',
        status: 500
      }
    }, { status: 500 });
  }
};