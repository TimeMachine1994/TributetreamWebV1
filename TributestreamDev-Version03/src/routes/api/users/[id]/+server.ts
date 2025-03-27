import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_USERS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/users/[id]
 * 
 * Get a single user by ID (admin or self)
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_USERS_PATH}/${id}`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * PUT /api/users/[id]
 * 
 * Update a user (full update)
 */
export const PUT: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_USERS_PATH}/${id}`,
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
 * PATCH /api/users/[id]
 * 
 * Update a user (partial update)
 */
export const PATCH: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_USERS_PATH}/${id}`,
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
 * DELETE /api/users/[id]
 * 
 * Delete a user (admin only)
 */
export const DELETE: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_USERS_PATH}/${id}`,
      request,
      method: 'DELETE',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};