import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_LOCATIONS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/locations/[id]/events
 * 
 * Get events for a specific location
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: `${WP_LOCATIONS_PATH}/${id}/events`,
      request,
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};