import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_BASE, createWpHeaders, formatErrorResponse, handleWpResponse } from '$lib/utils/wp-api';
import type { Tribute } from '$lib/types/tribute.types';

/**
 * GET /api/wp/tribute/[slug]
 * Get a tribute by slug
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // Get the slug from the params
    const { slug } = params;
    
    if (!slug) {
      return json({
        success: false,
        message: 'Tribute slug is required',
        status: 400
      }, { status: 400 });
    }
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tribute/${slug}`, {
      method: 'GET',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<Tribute>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to fetch tribute by slug'),
      { status: 500 }
    );
  }
};