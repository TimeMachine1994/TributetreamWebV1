/**
 * Tribute by slug API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  ensureResourceAccess
} from '../../../utils';
import type { 
  Tribute, 
  TributeResponse 
} from '../../../types/tributes';
import { ApiErrors } from '../../../utils/error-handler';

/**
 * GET handler for retrieving a tribute by slug
 * 
 * @route GET /api/v2/tributes/by-slug/:slug
 * @param request The request object
 * @returns Response with tribute data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { user, token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute slug from params
  const tributeSlug = params.slug;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get tribute data from WordPress API by slug
  const tributesResponse = await wpClient.get<{
    tributes: Record<string, unknown>[];
  }>(`wp/v2/tributes?slug=${tributeSlug}`);
  
  // Extract tributes array
  const tributes = Array.isArray(tributesResponse) ? tributesResponse : (tributesResponse.tributes || []);
  
  // Check if tribute exists
  if (!tributes.length || !tributes[0].id) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Get the first tribute (should be the only one with this slug)
  const tributeData = tributes[0];
  
  // Check if user has access to this tribute
  ensureResourceAccess(user, tributeData.author_id as number);
  
  // Format tribute data
  const formattedTribute: Tribute = {
    id: Number(tributeData.id),
    title: String(tributeData.title || ''),
    slug: String(tributeData.slug || ''),
    description: tributeData.description ? String(tributeData.description) : undefined,
    content: tributeData.content ? String(tributeData.content) : undefined,
    featured_image_url: tributeData.featured_image_url ? String(tributeData.featured_image_url) : undefined,
    status: String(tributeData.status || 'draft') as 'draft' | 'published' | 'private' | 'archived',
    created_at: String(tributeData.created_at || ''),
    updated_at: String(tributeData.updated_at || ''),
    published_at: tributeData.published_at ? String(tributeData.published_at) : undefined,
    author_id: Number(tributeData.author_id),
    author_name: tributeData.author_name ? String(tributeData.author_name) : undefined,
    funeral_director_id: tributeData.funeral_director_id ? Number(tributeData.funeral_director_id) : undefined,
    funeral_director_name: tributeData.funeral_director_name ? String(tributeData.funeral_director_name) : undefined,
    deceased_name: String(tributeData.deceased_name || ''),
    birth_date: tributeData.birth_date ? String(tributeData.birth_date) : undefined,
    death_date: tributeData.death_date ? String(tributeData.death_date) : undefined,
    funeral_date: tributeData.funeral_date ? String(tributeData.funeral_date) : undefined,
    funeral_location: tributeData.funeral_location ? String(tributeData.funeral_location) : undefined,
    meta_data: tributeData.meta_data as Record<string, unknown> | undefined,
    categories: Array.isArray(tributeData.categories) ? tributeData.categories.map(String) : undefined,
    tags: Array.isArray(tributeData.tags) ? tributeData.tags.map(String) : undefined
  };
  
  // Return response
  return formatResponse<TributeResponse['data']>(formattedTribute);
};
