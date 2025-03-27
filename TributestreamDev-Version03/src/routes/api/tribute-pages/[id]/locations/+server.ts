import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_TRIBUTE_PAGES_PATH } from '$lib/api/api-constants';

/**
 * GET /api/tribute-pages/[id]/locations
 * 
 * Get locations for a specific tribute
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_TRIBUTE_PAGES_PATH}/${id}/locations`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};