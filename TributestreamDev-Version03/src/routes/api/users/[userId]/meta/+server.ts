/**
 * User Metadata Endpoint
 * 
 * Handles getting all metadata for a user or creating/updating metadata
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated } from '$lib/server/authUtils';
import type { CreateOrUpdateUserMetaParams } from '$lib/server/types';

/**
 * @api {get} /api/users/:userId/meta Get all user metadata
 * @apiName GetUserMeta
 * @apiGroup Users
 * @apiDescription Retrieves all metadata for a user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Object} data.meta User metadata object
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
    const response = await forwardRequestToWordPress<{ meta: Record<string, unknown> }>(
      event,
      `/tributestream/v1/user-meta/${userId}`
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
 * @api {post} /api/users/:userId/meta Create or update user metadata
 * @apiName CreateOrUpdateUserMeta
 * @apiGroup Users
 * @apiDescription Creates or updates a user metadata entry
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 * @apiParam {Object} body Request body
 * @apiParam {String} body.meta_key Metadata key
 * @apiParam {*} body.meta_value Metadata value
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Boolean} data.success Operation success status
 */
export const POST: RequestHandler = async (event) => {
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
    
    // Check if user is accessing their own metadata or has permission
    if (authenticatedUserId !== userId) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to modify metadata for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    // Validate the input
    const body = await event.request.json() as CreateOrUpdateUserMetaParams;
    
    if (!body.meta_key) {
      return json({
        success: false,
        error: {
          code: 'MISSING_META_KEY',
          message: 'Metadata key is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    if (body.meta_value === undefined) {
      return json({
        success: false,
        error: {
          code: 'MISSING_META_VALUE',
          message: 'Metadata value is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ success: boolean }>(
      event,
      '/tributestream/v1/user-meta'
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error creating/updating user metadata:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create/update user metadata',
        status: 500
      }
    }, { status: 500 });
  }
};