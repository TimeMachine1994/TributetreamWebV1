import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';
import type { CreateTributePageRequest } from '$lib/types/tribute';

/**
 * GET /api/tribute
 * Retrieves all tribute pages
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const data = await wordpressRequest('/tributestream/v1/tribute-pages', 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/tribute
 * Creates a new tribute page
 */
export async function POST(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const body = await event.request.json() as CreateTributePageRequest;
    
    // Validate required fields
    if (!body.created_by_user_id || !body.point_of_contact_user_id || !body.loved_ones_name || !body.page_html) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const data = await wordpressRequest('/tributestream/v1/tribute-pages', 'POST', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}