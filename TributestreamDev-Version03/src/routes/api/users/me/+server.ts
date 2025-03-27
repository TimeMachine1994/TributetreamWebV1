import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_USERS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/users/me
 * 
 * Get current user
 */
export const GET: RequestHandler = async ({ fetch, request }) => {
  try {
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_USERS_PATH}/me`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};