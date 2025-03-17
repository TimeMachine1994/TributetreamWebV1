import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiErrorResponse, Tribute } from '$lib/types/tribute';

/**
 * GET /api/tributes/[id]
 * Retrieves a tribute by its ID
 */
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    console.log(`🔍 [Tribute By ID API] Fetching tribute with ID: ${id}`);
    
    if (!id || isNaN(Number(id))) {
      console.warn(`⚠️ [Tribute By ID API] Invalid tribute ID: ${id}`);
      return json({
        error: true,
        message: 'Invalid tribute ID',
        status: 400
      } as ApiErrorResponse, { status: 400 });
    }
    
    // Attempt to get authorization token (optional for this endpoint)
    const authHeader = request.headers.get('Authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [Tribute By ID API] Authorization token included in request');
    } else {
      console.log('ℹ️ [Tribute By ID API] No authorization token provided - accessing public data only');
    }
    
    // Forward request to WordPress API
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${id}`, {
      headers
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Tribute By ID API] WordPress API returned an error:', responseData);
      
      if (response.status === 404) {
        return json({
          error: true,
          message: 'Tribute not found',
          status: 404
        } as ApiErrorResponse, { status: 404 });
      }
      
      return json({
        error: true,
        message: responseData.message || 'Failed to fetch tribute',
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    console.log(`✅ [Tribute By ID API] Successfully fetched tribute: ${responseData.loved_one_name || 'Unknown'}`);
    return json(responseData as Tribute);
  } catch (error) {
    console.error('🚨 [Tribute By ID API] Unexpected error:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};