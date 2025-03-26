import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';
import type { CreateFuneralHomeRequest } from '$lib/types/tribute';

/**
 * GET /api/tribute/funeral-homes
 * Retrieves all funeral homes
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const data = await wordpressRequest('/tributestream/v1/funeral-homes', 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/tribute/funeral-homes
 * Creates a new funeral home
 */
export async function POST(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const body = await event.request.json() as CreateFuneralHomeRequest;
    
    // Validate required fields
    if (!body.created_by_user_id || !body.fh_name || !body.fh_address || !body.fh_phone_number) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const data = await wordpressRequest('/tributestream/v1/funeral-homes', 'POST', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}