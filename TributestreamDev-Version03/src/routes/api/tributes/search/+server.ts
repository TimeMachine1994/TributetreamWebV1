import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiErrorResponse, TributeCollection } from '$lib/types/tribute';

/**
 * GET /api/tributes/search
 * Searches for tributes by name
 * Query parameters:
 * - query: The search term
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 10)
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Extract query parameters
    const query = url.searchParams.get('query') || '';
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    
    if (!query) {
      return json({
        error: true,
        message: 'Search query is required',
        status: 400
      } as ApiErrorResponse, { status: 400 });
    }
    
    console.log(`🔍 [Tribute Search API] Searching tributes with query: "${query}", page: ${page}, perPage: ${perPage}`);
    
    // Build the WordPress API URL with parameters
    const wpApiUrl = new URL('https://wp.tributestream.com/wp-json/tributestream/v1/tributes');
    wpApiUrl.searchParams.set('search', query);
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Tribute Search API] Error searching tributes:', errorData);
      return json({
        error: true,
        message: errorData.message || 'Failed to search tributes',
        status: response.status
      } as ApiErrorResponse, { status: response.status });
    }
    
    // Parse and return the response data
    const data = await response.json() as TributeCollection;
    console.log(`✅ [Tribute Search API] Found ${data.tributes?.length || 0} tributes matching "${query}"`);
    
    return json(data);
  } catch (error) {
    console.error('🚨 [Tribute Search API] Unexpected error:', error);
    return json({
      error: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse, { status: 500 });
  }
};