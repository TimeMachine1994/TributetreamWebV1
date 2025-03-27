import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CreateTributePayload, ApiErrorResponse } from '$lib/types/tribute';

/**
 * GET /api/tributes
 * Returns a paginated list of tributes
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Extract query parameters
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    
    console.log(`🔍 [Tributes API] Fetching tributes - page: ${page}, perPage: ${perPage}, search: ${search}`);
    
    // Build the WordPress API URL with parameters
    const wpApiUrl = new URL('https://wp.tributestream.com/wp-json/tributestream/v1/tributes');
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    if (search) {
      wpApiUrl.searchParams.set('search', search);
    }
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Tributes API] Error fetching tributes:', errorData);
      return json({
        error: true,
        message: errorData.message || 'Failed to fetch tributes',
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    // Parse and return the response data
    const data = await response.json();
    console.log(`✅ [Tributes API] Successfully fetched ${data.tributes?.length || 0} tributes`);
    
    return json(data);
  } catch (error) {
    console.error('🚨 [Tributes API] Unexpected error:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};

/**
 * POST /api/tributes
 * Creates a new tribute
 * Requires authentication
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    console.log('🚀 [Tributes API] Processing tribute creation request');
    
    // Check for authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ [Tributes API] Missing or invalid Authorization header');
      return json({
        error: true,
        message: 'Authentication required',
        status: 401
      } as ApiErrorResponse, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Parse request body
    const payload = await request.json() as CreateTributePayload;
    
    // Validate required fields
    const errors: string[] = [];
    if (!payload.user_id) errors.push("user_id is required");
    if (!payload.loved_one_name) errors.push("loved_one_name is required");
    if (!payload.phone_number) errors.push("phone_number is required");
    
    if (errors.length > 0) {
      console.warn('⚠️ [Tributes API] Validation errors:', errors);
      return json({
        error: true,
        message: 'Validation failed: ' + errors.join(', '),
        status: 400
      } as ApiErrorResponse, { status: 400 });
    }
    
    console.log('✅ [Tributes API] Validation passed, forwarding to WordPress API');
    
    // Forward the request to the WordPress API
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Tributes API] WordPress API returned an error:', responseData);
      return json({
        error: true,
        message: responseData.message || 'Failed to create tribute',
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    console.log(`✅ [Tributes API] Tribute created successfully with ID: ${responseData.id}`);
    return json(responseData);
  } catch (error) {
    console.error('🚨 [Tributes API] Unexpected error during tribute creation:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};