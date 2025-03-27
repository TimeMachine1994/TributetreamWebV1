/**
 * Tribute by Slug Endpoint
 * 
 * Retrieves a tribute by its slug
 */

import { json } from '@sveltejs/kit';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import type { RequestHandler } from './$types';
import type { Tribute } from '$lib/server/types';

/**
 * @api {get} /api/tribute/:slug Get tribute by slug
 * @apiName GetTributeBySlug
 * @apiGroup Tributes
 * @apiDescription Retrieves a tribute by its slug
 *
 * @apiParam {String} slug Tribute slug
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Tribute data
 */
export const GET: RequestHandler = async (event) => {
  const { slug } = event.params;
  
  // Validate the slug
  if (!slug) {
    return json({
      success: false,
      error: {
        code: 'MISSING_PARAMETER',
        message: 'Tribute slug is required',
        status: 400
      },
      status: 400
    }, { status: 400 });
  }
  
  try {
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<Tribute>(
      event,
      `/tribute/${encodeURIComponent(slug)}`
    );
    
    // Return the response
    return json(response, { status: response.status || 200 });
  } catch (error) {
    console.error('Error getting tribute by slug:', error);
    
    // Return error response
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      },
      status: 500
    }, { status: 500 });
  }
};