import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardApiRequest, handleApiError } from '$lib/server/apiUtils';

/**
 * GET handler for retrieving form data for a user
 */
export const GET: RequestHandler = async ({ params, request, fetch, locals }) => {
  try {
    // Ensure we have a valid user ID
    const userId = params.userId;
    if (!userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Ensure user is authenticated
    if (!locals.authenticated || !locals.token) {
      return json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Use the forwardApiRequest utility to properly forward the request to WordPress
    const response = await forwardApiRequest({
      path: `/api/users/${userId}/form-data`,
      request,
      fetch,
      method: 'GET'
    });

    // Return the response
    return json(response, { status: response.status || 200 });
  } catch (error) {
    console.error('Error fetching form data:', error);
    return handleApiError(error);
  }
};

/**
 * POST handler for saving form data for a user
 */
export const POST: RequestHandler = async ({ params, request, fetch, locals }) => {
  try {
    // Ensure we have a valid user ID
    const userId = params.userId;
    if (!userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Ensure user is authenticated
    if (!locals.authenticated || !locals.token) {
      return json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Use the forwardApiRequest utility to properly forward the request to WordPress
    const response = await forwardApiRequest({
      path: `/api/users/${userId}/form-data`,
      request,
      fetch,
      method: 'POST',
      body
    });

    // Return the response
    return json(response, { status: response.status || 200 });
  } catch (error) {
    console.error('Error saving form data:', error);
    return handleApiError(error);
  }
};