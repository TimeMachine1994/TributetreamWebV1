import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_SCHEDULES_PATH } from '$lib/api/api-constants';

/**
 * GET /api/schedules/[id]
 * 
 * Get a single schedule by ID
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_SCHEDULES_PATH}/${id}`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PUT /api/schedules/[id]
 * 
 * Update a schedule (full update)
 */
export const PUT: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_SCHEDULES_PATH}/${id}`,
      request,
      method: 'PUT',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PATCH /api/schedules/[id]
 * 
 * Update a schedule (partial update)
 */
export const PATCH: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_SCHEDULES_PATH}/${id}`,
      request,
      method: 'PATCH',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * DELETE /api/schedules/[id]
 * 
 * Delete a schedule
 */
export const DELETE: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_SCHEDULES_PATH}/${id}`,
      request,
      method: 'DELETE',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};