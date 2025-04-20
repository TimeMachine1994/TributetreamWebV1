import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_BASE, createWpHeaders, formatErrorResponse, handleWpResponse } from '$lib/utils/wp-api';
import type { Tribute } from '$lib/types/tribute.types';

/**
 * GET /api/wp/tributes/by-user/[user_id]
 * Get tributes by user ID
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // If no token, return unauthorized
    if (!token) {
      return json({
        success: false,
        message: 'Unauthorized',
        status: 401
      }, { status: 401 });
    }
    
    // Get the user ID from the params
    const { user_id } = params;
    
    if (!user_id) {
      return json({
        success: false,
        message: 'User ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tributes/by-user/${user_id}`, {
      method: 'GET',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<{ tributes: Tribute[] }>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to fetch tributes by user'),
      { status: 500 }
    );
  }
};