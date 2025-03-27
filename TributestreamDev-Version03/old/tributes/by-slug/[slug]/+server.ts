import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiErrorResponse, Tribute } from '$lib/types/tribute';

/**
 * GET /api/tributes/by-slug/[slug]
 * Retrieves a tribute by its slug
 * This is a public endpoint that doesn't require authentication
 */
export const GET: RequestHandler = async ({ params, fetch }) => {
  try {
    const slug = params.slug;
    
    console.log(`🔍 [Tribute By Slug API] Fetching tribute with slug: ${slug}`);
    
    if (!slug) {
      console.warn('⚠️ [Tribute By Slug API] No slug provided');
      return json({
        error: true,
        message: 'Slug parameter is required',
        status: 400
      } as ApiErrorResponse, { status: 400 });
    }
    
    // Forward request to WordPress API
    // The WordPress plugin exposes the endpoint at /tribute/{slug} rather than /tributes/{slug}
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
    
    // Handle error responses
    if (!response.ok) {
      // Try to parse the error response
      let errorMessage = 'Failed to fetch tribute by slug';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use the default message
      }
      
      console.error(`❌ [Tribute By Slug API] Error: ${errorMessage} (${response.status})`);
      
      if (response.status === 404) {
        return json({
          error: true,
          message: 'Tribute not found',
          status: 404
        } as ApiErrorResponse, { status: 404 });
      }
      
      return json({
        error: true,
        message: errorMessage,
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    // Parse and return the response data
    const tributeData = await response.json();
    console.log(`✅ [Tribute By Slug API] Successfully fetched tribute: ${tributeData.loved_one_name || 'Unknown'}`);
    
    return json(tributeData as Tribute);
  } catch (error) {
    console.error('🚨 [Tribute By Slug API] Unexpected error:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};