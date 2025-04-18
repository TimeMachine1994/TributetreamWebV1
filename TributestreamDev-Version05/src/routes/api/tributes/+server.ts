import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_URL } from '$lib/utils/env';

/**
 * Tributes API handler
 *
 * This endpoint proxies requests to the WordPress REST API for tributes.
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  console.log('[Server] GET /api/tributes request received');
  
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    console.log('[Server] JWT token present:', !!token);
    
    // Get query parameters
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    console.log(`[Server] Query params: page=${page}, perPage=${perPage}`);
    
    // Build the WordPress API URL
    const wpApiUrl = new URL(`${WP_API_URL}/funeral/v2/tribute-pages`);
    
    // Add query parameters
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    
    console.log(`[Server] WordPress API URL: ${wpApiUrl.toString()}`);
    console.log(`[Server] WP_API_URL env variable: ${WP_API_URL}`);
    
    // Set up headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // Add authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Make the request to the WordPress API
    console.log('[Server] Sending request to WordPress API...');
    const response = await fetch(wpApiUrl.toString(), {
      method: 'GET',
      headers
    });
    
    console.log(`[Server] WordPress API response status: ${response.status} ${response.statusText}`);
    
    // Get the response data
    const data = await response.json();
    console.log('[Server] WordPress API response data:', data);
    
    // If the response is not OK, return an error
    if (!response.ok) {
      console.error('[Server] WordPress API error:', data);
      return json({
        success: false,
        message: data.message || 'Failed to fetch tributes',
        status: response.status
      }, { status: response.status });
    }
    
    // Check if the expected data structure exists
    if (!data.data || !data.data.tributes) {
      console.error('[Server] Unexpected data structure:', data);
      return json({
        success: false,
        message: 'Unexpected data structure from WordPress API',
        status: 500
      }, { status: 500 });
    }
    
    // Return the response
    const result = {
      success: true,
      data: data.data?.tributes || [],
      pagination: {
        total_items: data.data?.total_items || 0,
        total_pages: data.data?.total_pages || 0,
        current_page: parseInt(page)
      }
    };
    
    console.log('[Server] Returning response:', result);
    return json(result);
  } catch (error) {
    console.error('Error fetching tributes:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch tributes',
      status: 500
    }, { status: 500 });
  }
};

/**
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
    const response = await fetch(`${WP_API_URL}/funeral/v2/tribute-pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to create tribute',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response
    return json({
      success: true,
      data: data.data
    });
  } catch (error) {
    console.error('Error creating tribute:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create tribute',
      status: 500
    }, { status: 500 });
  }
};