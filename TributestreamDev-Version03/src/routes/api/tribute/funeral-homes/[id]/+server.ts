import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';

/**
 * GET /api/tribute/funeral-homes/[id]
 * Retrieves a specific funeral home
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/funeral-homes/${id}`, 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/tribute/funeral-homes/[id]
 * Updates a specific funeral home
 */
export async function PUT(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const body = await event.request.json();
    const data = await wordpressRequest(`/tributestream/v1/funeral-homes/${id}`, 'PUT', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/tribute/funeral-homes/[id]
 * Deletes a specific funeral home
 */
export async function DELETE(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/funeral-homes/${id}`, 'DELETE', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}