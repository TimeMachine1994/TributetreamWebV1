/**
 * Form Data Save Endpoint
 * 
 * Saves form data for a user
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated, getAuthenticatedUserId } from '$lib/server/authUtils';
import type { SaveFormDataParams, FormData } from '$lib/server/types';

/**
 * @api {post} /api/forms Save form data
 * @apiName SaveFormData
 * @apiGroup Forms
 * @apiDescription Saves form data for a user
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Object} body Request body
 * @apiParam {Number} body.user_id User ID
 * @apiParam {Object} body.form_data Form data object
 * @apiParam {Number} [body.tribute_id] Optional tribute ID to update
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data
 * @apiSuccess {Boolean} data.success Operation success status
 */
export const POST: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated and get the user ID
    await ensureAuthenticated(event);
    const authenticatedUserId = await getAuthenticatedUserId(event);
    
    // Validate the input
    const body = await event.request.json() as SaveFormDataParams;
    
    if (!body.user_id) {
      return json({
        success: false,
        error: {
          code: 'MISSING_USER_ID',
          message: 'User ID is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Check if user is saving their own form data or has permission
    if (authenticatedUserId !== body.user_id) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to save form data for this user',
          status: 403
        }
      }, { status: 403 });
    }
    
    if (!body.form_data || typeof body.form_data !== 'object') {
      return json({
        success: false,
        error: {
          code: 'MISSING_FORM_DATA',
          message: 'Form data is required',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Validate required form fields
    const requiredFields: (keyof FormData)[] = [
      'director-first-name',
      'director-last-name',
      'deceased-first-name',
      'deceased-last-name',
      'email-address',
      'phone-number'
    ];
    
    const missingFields = requiredFields.filter(field => !body.form_data[field]);
    
    if (missingFields.length > 0) {
      return json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: `Missing required form fields: ${missingFields.join(', ')}`,
          status: 400
        }
      }, { status: 400 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ success: boolean }>(
      event,
      '/tributestream/v1/form-data'
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error saving form data:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to save form data',
        status: 500
      }
    }, { status: 500 });
  }
};