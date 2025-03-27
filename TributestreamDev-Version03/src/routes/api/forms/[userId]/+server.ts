/**
 * Form Data Endpoint (GET)
 * 
 * Retrieves form data for a specific user
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated } from '$lib/server/authUtils';
import type { FormData } from '$lib/server/types';

/**
 * @api {get} /api/forms/:userId Get form data
 * @apiName GetFormData
 * @apiGroup Forms
 * @apiDescription Retrieves form data for a specific user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userId User ID
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Object} data.form_data User's form data
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
    
    // Check if user is accessing their own form data or has permission
    if (authenticatedUserId !== userId) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to view form data for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ form_data: FormData }>(
      event,
      `/tributestream/v1/form-data/${userId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 404) });
  } catch (error) {
    console.error('Error fetching form data:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch form data',
        status: 500
      }
    }, { status: 500 });
  }
};