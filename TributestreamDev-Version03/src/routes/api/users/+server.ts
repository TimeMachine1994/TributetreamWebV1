import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_USERS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/users
 * 
 * Get all users (admin only)
 */
export const GET: RequestHandler = async ({ url, fetch, request }) => {
  try {
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: WP_USERS_PATH,
      queryParams: url.searchParams,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * POST /api/users
 * 
 * Create a new user (admin only)
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: WP_USERS_PATH,
      request,
      method: 'POST',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};