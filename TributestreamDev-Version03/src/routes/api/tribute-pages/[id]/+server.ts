import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_TRIBUTE_PAGES_PATH } from '$lib/api/api-constants';

/**
 * GET /api/tribute-pages/[id]
 * 
 * Get a single tribute page by ID
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_TRIBUTE_PAGES_PATH}/${id}`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PUT /api/tribute-pages/[id]
 * 
 * Update an existing tribute page
 */
export const PUT: RequestHandler = async ({ params, request, fetch }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_TRIBUTE_PAGES_PATH}/${id}`,
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
 * PATCH /api/tribute-pages/[id]
 * 
 * Partially update an existing tribute page
 */
export const PATCH: RequestHandler = async ({ params, request, fetch }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_TRIBUTE_PAGES_PATH}/${id}`,
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
 * DELETE /api/tribute-pages/[id]
 * 
 * Delete a tribute page
 */
export const DELETE: RequestHandler = async ({ params, request, fetch }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_TRIBUTE_PAGES_PATH}/${id}`,
      request,
      method: 'DELETE',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};