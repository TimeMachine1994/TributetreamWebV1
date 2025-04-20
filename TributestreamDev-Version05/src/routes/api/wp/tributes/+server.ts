import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_BASE, createWpHeaders, formatErrorResponse, handleWpResponse } from '$lib/utils/wp-api';
import type { TributePaginatedResponse, SuccessResponse } from '$lib/types/tribute.types';

/**
 * GET /api/wp/tributes
 * Get all tributes with pagination
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // Get query parameters
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    
    // Build the WordPress API URL
    const wpApiUrl = new URL(`${WP_API_BASE}/tributes`);
    
    // Add query parameters
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    if (search) {
      wpApiUrl.searchParams.set('search', search);
    }
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString(), {
      method: 'GET',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<TributePaginatedResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to fetch tributes'),
      { status: 500 }
    );
  }
};

/**
 * POST /api/wp/tributes
 * Create a new tribute
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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
    
    // Get the request body
    const body = await request.json();
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tributes`, {
      method: 'POST',
      headers: createWpHeaders(token),
      body: JSON.stringify(body)
    });
    
    const data = await handleWpResponse<SuccessResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to create tribute'),
      { status: 500 }
    );
  }
};