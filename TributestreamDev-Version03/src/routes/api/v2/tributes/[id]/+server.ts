/**
 * Tribute by ID API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatResponse,
  formatUpdatedResponse,
  formatDeletedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  ensureResourceAccess
} from '../../utils';
import { 
  validateDate
} from '../../utils/validation';
import type { 
  Tribute, 
  TributeUpdateRequest, 
  TributeResponse 
} from '../../types/tributes';
import { ApiErrors } from '../../utils/error-handler';

/**
 * GET handler for retrieving a tribute by ID
 * 
 * @route GET /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with tribute data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { user, token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute ID from params
  const tributeId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get tribute data from WordPress API
  const tributeData = await wpClient.get<Record<string, unknown>>(`wp/v2/tributes/${tributeId}`);
  
  // Check if tribute exists
  if (!tributeData || !tributeData.id) {
    throw ApiErrors.notFound('Tribute');
  }
  
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

/**
 * PUT handler for updating a tribute by ID
 * 
 * @route PUT /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with updated tribute data
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  // Ensure user is authenticated
  const { user, token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute ID from params
  const tributeId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing tribute to check ownership
  const existingTribute = await wpClient.get<Record<string, unknown>>(`wp/v2/tributes/${tributeId}`);
  
  // Check if tribute exists
  if (!existingTribute || !existingTribute.id) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Check if user has access to this tribute
  ensureResourceAccess(user, existingTribute.author_id as number);
  
  // Parse request body
  const data: TributeUpdateRequest = await request.json();
  
  // Validate dates if provided
  if (data.birth_date) {
    validateDate(data.birth_date, 'Birth date');
  }
  
  if (data.death_date) {
    validateDate(data.death_date, 'Death date');
  }
  
  if (data.funeral_date) {
    validateDate(data.funeral_date, 'Funeral date');
  }
  
  // Prepare update data
  const updateData: Record<string, unknown> = {};
  
  // Only include fields that are provided
  if (data.title) updateData.title = data.title;
  if (data.slug) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.featured_image_url !== undefined) updateData.featured_image_url = data.featured_image_url;
  if (data.status) updateData.status = data.status;
  if (data.author_id) updateData.author_id = data.author_id;
  if (data.funeral_director_id !== undefined) updateData.funeral_director_id = data.funeral_director_id;
  if (data.deceased_name) updateData.deceased_name = data.deceased_name;
  if (data.birth_date !== undefined) updateData.birth_date = data.birth_date;
  if (data.death_date !== undefined) updateData.death_date = data.death_date;
  if (data.funeral_date !== undefined) updateData.funeral_date = data.funeral_date;
  if (data.funeral_location !== undefined) updateData.funeral_location = data.funeral_location;
  if (data.meta_data !== undefined) updateData.meta_data = data.meta_data;
  if (data.categories !== undefined) updateData.categories = data.categories;
  if (data.tags !== undefined) updateData.tags = data.tags;
  
  // Update tribute in WordPress
  const updatedTribute = await wpClient.put<Record<string, unknown>>(`wp/v2/tributes/${tributeId}`, updateData);
  
  // Format tribute data
  const formattedTribute: Tribute = {
    id: Number(updatedTribute.id),
    title: String(updatedTribute.title || ''),
    slug: String(updatedTribute.slug || ''),
    description: updatedTribute.description ? String(updatedTribute.description) : undefined,
    content: updatedTribute.content ? String(updatedTribute.content) : undefined,
    featured_image_url: updatedTribute.featured_image_url ? String(updatedTribute.featured_image_url) : undefined,
    status: String(updatedTribute.status || 'draft') as 'draft' | 'published' | 'private' | 'archived',
    created_at: String(updatedTribute.created_at || ''),
    updated_at: String(updatedTribute.updated_at || ''),
    published_at: updatedTribute.published_at ? String(updatedTribute.published_at) : undefined,
    author_id: Number(updatedTribute.author_id),
    author_name: updatedTribute.author_name ? String(updatedTribute.author_name) : undefined,
    funeral_director_id: updatedTribute.funeral_director_id ? Number(updatedTribute.funeral_director_id) : undefined,
    funeral_director_name: updatedTribute.funeral_director_name ? String(updatedTribute.funeral_director_name) : undefined,
    deceased_name: String(updatedTribute.deceased_name || ''),
    birth_date: updatedTribute.birth_date ? String(updatedTribute.birth_date) : undefined,
    death_date: updatedTribute.death_date ? String(updatedTribute.death_date) : undefined,
    funeral_date: updatedTribute.funeral_date ? String(updatedTribute.funeral_date) : undefined,
    funeral_location: updatedTribute.funeral_location ? String(updatedTribute.funeral_location) : undefined,
    meta_data: updatedTribute.meta_data as Record<string, unknown> | undefined,
    categories: Array.isArray(updatedTribute.categories) ? updatedTribute.categories.map(String) : undefined,
    tags: Array.isArray(updatedTribute.tags) ? updatedTribute.tags.map(String) : undefined
  };
  
  // Return updated response
  return formatUpdatedResponse<TributeResponse['data']>(formattedTribute, 'Tribute');
};

/**
 * DELETE handler for deleting a tribute by ID
 * 
 * @route DELETE /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with deleted tribute ID
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { user, token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute ID from params
  const tributeId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing tribute to check ownership
  const existingTribute = await wpClient.get<Record<string, unknown>>(`wp/v2/tributes/${tributeId}`);
  
  // Check if tribute exists
  if (!existingTribute || !existingTribute.id) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Check if user has access to this tribute
  ensureResourceAccess(user, existingTribute.author_id as number);
  
  // Delete tribute in WordPress
  await wpClient.delete(`wp/v2/tributes/${tributeId}?force=true`);
  
  // Return deleted response
  return formatDeletedResponse(tributeId, 'Tribute');
};
