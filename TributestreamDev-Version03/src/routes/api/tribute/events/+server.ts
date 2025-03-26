import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';
import type { CreateEventRequest } from '$lib/types/tribute';

/**
 * GET /api/tribute/events
 * Retrieves all events
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const data = await wordpressRequest('/tributestream/v1/events', 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/tribute/events
 * Creates a new event
 */
export async function POST(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const body = await event.request.json() as CreateEventRequest;
    
    // Validate required fields
    if (!body.location_id || !body.stream_html) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const data = await wordpressRequest('/tributestream/v1/events', 'POST', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}