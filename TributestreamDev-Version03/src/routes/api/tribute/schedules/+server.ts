import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { wordpressRequest } from '$lib/api/wordpress';
import { handleApiError } from '$lib/api/errors';
import { ensureAuthenticated } from '$lib/api/auth';
import type { CreateScheduleRequest } from '$lib/types/tribute';

/**
 * GET /api/tribute/schedules
 * Retrieves all schedules
 */
export async function GET(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const data = await wordpressRequest('/tributestream/v1/schedules', 'GET', token);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/tribute/schedules
 * Creates a new schedule
 */
export async function POST(event: RequestEvent) {
  const token = ensureAuthenticated(event);
  
  try {
    const body = await event.request.json() as CreateScheduleRequest;
    
    // Validate required fields
    if (!body.funeral_director_user_id || !body.funeral_home_id || !body.number_of_days || !body.tribute_id) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const data = await wordpressRequest('/tributestream/v1/schedules', 'POST', token, body);
    return json(data);
  } catch (err) {
    return handleApiError(err);
  }
}