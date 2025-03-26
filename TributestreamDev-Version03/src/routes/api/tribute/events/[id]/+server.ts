import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';

/**
 * GET /api/tribute/events/[id]
 * Retrieves a specific event
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/events/${id}`, 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/tribute/events/[id]
 * Updates a specific event
 */
export async function PUT(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const body = await event.request.json();
    const data = await wordpressRequest(`/tributestream/v1/events/${id}`, 'PUT', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/tribute/events/[id]
 * Deletes a specific event
 */
export async function DELETE(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  const { id } = event.params;
  
  try {
    const data = await wordpressRequest(`/tributestream/v1/events/${id}`, 'DELETE', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}