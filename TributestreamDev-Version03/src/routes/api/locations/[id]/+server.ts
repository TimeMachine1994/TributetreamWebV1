import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_LOCATIONS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/locations/[id]
 * 
 * Get a single location by ID
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_LOCATIONS_PATH}/${id}`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PUT /api/locations/[id]
 * 
 * Update a location (full update)
 */
export const PUT: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_LOCATIONS_PATH}/${id}`,
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
 * PATCH /api/locations/[id]
 * 
 * Update a location (partial update)
 */
export const PATCH: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_LOCATIONS_PATH}/${id}`,
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
 * DELETE /api/locations/[id]
 * 
 * Delete a location
 */
export const DELETE: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_LOCATIONS_PATH}/${id}`,
      request,
      method: 'DELETE',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};