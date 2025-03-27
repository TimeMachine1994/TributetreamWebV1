import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_FUNERAL_HOMES_PATH } from '$lib/api/api-constants';

/**
 * GET /api/funeral-homes/[id]
 * 
 * Get a single funeral home by ID
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_FUNERAL_HOMES_PATH}/${id}`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PUT /api/funeral-homes/[id]
 * 
 * Update a funeral home (full update)
 */
export const PUT: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_FUNERAL_HOMES_PATH}/${id}`,
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
 * PATCH /api/funeral-homes/[id]
 * 
 * Update a funeral home (partial update)
 */
export const PATCH: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_FUNERAL_HOMES_PATH}/${id}`,
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
 * DELETE /api/funeral-homes/[id]
 * 
 * Delete a funeral home
 */
export const DELETE: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_FUNERAL_HOMES_PATH}/${id}`,
      request,
      method: 'DELETE',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};