import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';

/**
 * GET /api/tribute/locations/[id]
 * Retrieves a specific location
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/locations/${id}`, 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/tribute/locations/[id]
 * Updates a specific location
 */
export async function PUT(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const body = await event.request.json();
    const data = await wordpressRequest(`/tributestream/v1/locations/${id}`, 'PUT', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/tribute/locations/[id]
 * Deletes a specific location
 */
export async function DELETE(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/locations/${id}`, 'DELETE', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}