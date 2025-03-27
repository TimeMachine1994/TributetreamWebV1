import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';
import { WP_EVENTS_PATH } from '$lib/api/api-constants';

/**
 * GET /api/events
 * 
 * Get all events with optional filtering
 */
export const GET: RequestHandler = async ({ url, fetch, request }) => {
  try {
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: WP_EVENTS_PATH,
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
 * POST /api/events
 * 
 * Create a new event
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    // Forward the request to the WordPress API
    const response = await forwardApiRequest({
      path: WP_EVENTS_PATH,
      request,
      method: 'POST',
      fetch
    });

    return json(response);
  } catch (error) {
    return handleApiError(error);
  }
};