/**
 * Tribute Page By Slug Endpoint
 * 
 * Handles retrieving a tribute page by its slug.
 * 
 * GET /api/tribute-pages/by-slug/[slug] - Get a tribute page by slug
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  FUNERAL_API_PATH
} from '$lib/server/apiUtils';
import type { TributePage } from '$lib/server/types';

/**
 * Handle GET requests to retrieve a tribute page by slug
 */
export async function GET(event: RequestEvent) {
  try {
    const { params } = event;
    const slug = params.slug;
    
    if (!slug) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid tribute page slug',
          400
        ),
        { status: 400 }
      );
    }
    
    // Forward to WordPress API
    const response = await forwardRequestToWordPress<{ data: TributePage }>(
      event,
      `${FUNERAL_API_PATH}/tribute-pages/by-slug/${slug}`
    );
    
    // Return the response
    return json(response, { status: response.status });
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error retrieving tribute page by slug:', error);
    
    return json(
      createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      ),
      { status: 500 }
    );
  }
}