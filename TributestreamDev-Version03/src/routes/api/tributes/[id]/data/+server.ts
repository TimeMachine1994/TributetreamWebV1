/**
 * Tribute Extended Data Endpoint
 * 
 * Handles operations on a tribute's extended data
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardRequestToWordPress } from '$lib/server/apiUtils';
import { ensureAuthenticated } from '$lib/server/authUtils';

/**
 * @api {get} /api/tributes/:id/data Get tribute extended data
 * @apiName GetTributeData
 * @apiGroup Tributes
 * @apiDescription Retrieves the extended data for a tribute
 *
 * @apiParam {Number} id Tribute ID
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Extended data object
 */
export const GET: RequestHandler = async (event) => {
  try {
    const tributeId = event.params.id;
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<Record<string, unknown>>(
      event,
      `/tributestream/v1/tribute-data/${tributeId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 404) });
  } catch (error) {
    console.error('Error fetching tribute data:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch tribute data',
        status: 500
      }
    }, { status: 500 });
  }
};

/**
 * @api {post} /api/tributes/:id/data Create or replace tribute data
 * @apiName CreateOrReplaceTributeData
 * @apiGroup Tributes
 * @apiDescription Creates or completely replaces the extended data for a tribute
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Tribute ID
 * @apiParam {Object} data Extended data object (request body)
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data with success status
 */
export const POST: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated(event);
    
    const tributeId = event.params.id;
    
    // Validate the input
    const body = await event.request.json();
    
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Extended data must be a valid object',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ success: boolean }>(
      event,
      `/tributestream/v1/tribute-data/${tributeId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error creating tribute data:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create tribute data',
        status: 500
      }
    }, { status: 500 });
  }
};

/**
 * @api {put} /api/tributes/:id/data Update tribute data
 * @apiName UpdateTributeData
 * @apiGroup Tributes
 * @apiDescription Updates (merges) the extended data for a tribute
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Tribute ID
 * @apiParam {Object} data Extended data object to merge (request body)
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object} data Response data with success status
 */
export const PUT: RequestHandler = async (event) => {
  try {
    // Ensure user is authenticated
    await ensureAuthenticated(event);
    
    const tributeId = event.params.id;
    
    // Validate the input
    const body = await event.request.json();
    
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Extended data must be a valid object',
          status: 400
        }
      }, { status: 400 });
    }
    
    if (Object.keys(body).length === 0) {
      return json({
        success: false,
        error: {
          code: 'EMPTY_UPDATE',
          message: 'No update data provided',
          status: 400
        }
      }, { status: 400 });
    }
    
    // Forward the request to WordPress
    const response = await forwardRequestToWordPress<{ success: boolean }>(
      event,
      `/tributestream/v1/tribute-data/${tributeId}`
    );
    
    // Return the response
    return json(response, { status: response.success ? 200 : (response.status || 500) });
  } catch (error) {
    console.error('Error updating tribute data:', error);
    
    return json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update tribute data',
        status: 500
      }
    }, { status: 500 });
  }
};