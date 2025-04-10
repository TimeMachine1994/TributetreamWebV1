import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiErrorResponse } from '$lib/types/tribute';

/**
 * PUT /api/tributes/[id]/html
 * Updates the HTML content of a tribute
 * Requires authentication
 */
export const PUT: RequestHandler = async ({ params, request, fetch, cookies }) => {
  try {
    const id = params.id;
    const { custom_html } = await request.json();
    
    // Get auth token from cookies
    const token = cookies.get('jwt_token');
    if (!token) {
      return json({ 
        error: true, 
        message: 'Authentication required', 
        status: 401 
      } as ApiErrorResponse, { status: 401 });
    }
    
    console.log(`🔄 [Tribute HTML API] Updating HTML for tribute ID: ${id}`);
    
    // Forward request to WordPress API
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${id}/html`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ custom_html })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Tribute HTML API] WordPress API returned an error:', responseData);
      return json({
        error: true,
        message: responseData.message || 'Failed to update tribute HTML',
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    console.log(`✅ [Tribute HTML API] Successfully updated HTML for tribute ID: ${id}`);
    return json(responseData);
  } catch (error) {
    console.error('🚨 [Tribute HTML API] Unexpected error:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};