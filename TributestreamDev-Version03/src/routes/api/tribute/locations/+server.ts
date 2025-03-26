import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';
import type { CreateLocationRequest } from '$lib/types/tribute';

/**
 * GET /api/tribute/locations
 * Retrieves all locations
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const data = await wordpressRequest('/tributestream/v1/locations', 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/tribute/locations
 * Creates a new location
 */
export async function POST(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const body = await event.request.json() as CreateLocationRequest;
    
    // Validate required fields
    if (!body.tribute_id || !body.location_name || body.sort_order === undefined || !body.location_address) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const data = await wordpressRequest('/tributestream/v1/locations', 'POST', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}