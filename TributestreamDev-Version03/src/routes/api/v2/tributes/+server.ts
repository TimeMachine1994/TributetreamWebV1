/**
 * Tributes API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  formatCreatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient
} from '../utils';
import { 
  validateRequired, 
  validateDate,
  validatePagination
} from '../utils/validation';
import type { 
  Tribute, 
  TributeCreateRequest, 
  TributesListResponse, 
  TributeResponse 
} from '../types/tributes';
import type { ListQueryParams } from '../types';

/**
 * GET handler for retrieving a list of tributes
 * 
 * @route GET /api/v2/tributes
 * @param request The request object
 * @returns Response with paginated list of tributes
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
    
  // Parse query parameters
  const page = Number(url.searchParams.get('page') || '1');
  const perPage = Number(url.searchParams.get('per_page') || '10');
  const search = url.searchParams.get('search') || '';
  const sortBy = url.searchParams.get('sort_by') || 'created_at';
  const sortOrder = url.searchParams.get('sort_order') || 'desc';
  const status = url.searchParams.get('status') || '';
  const authorId = url.searchParams.get('author_id') || '';
  const funeralDirectorId = url.searchParams.get('funeral_director_id') || '';
  
  // Validate pagination parameters
  validatePagination(page, perPage);
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Build query parameters
  const queryParams: ListQueryParams = {
    page,
    per_page: perPage,
    search,
    sort_by: sortBy,
    sort_order: sortOrder as 'asc' | 'desc'
  };
  
  // Add optional filters
  if (status) {
    queryParams.status = status;
  }
  
  if (authorId) {
    queryParams.author_id = Number(authorId);
  }
  
  if (funeralDirectorId) {
    queryParams.funeral_director_id = Number(funeralDirectorId);
  }
  
  // Convert to URL search params
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  // Get tributes from WordPress API
  const tributesResponse = await wpClient.get<{
    tributes: Record<string, unknown>[];
    total?: number;
    headers?: { 'X-WP-Total'?: string };
  }>(`wp/v2/tributes?${params.toString()}`);
  
  // Extract tributes array and total count
  const tributes = Array.isArray(tributesResponse) ? tributesResponse : (tributesResponse.tributes || []);
  const totalTributes = tributesResponse.total || 
                     (tributesResponse.headers && tributesResponse.headers['X-WP-Total'] ? 
                      parseInt(tributesResponse.headers['X-WP-Total'], 10) : 
                      tributes.length);
  
  // Format tribute data
  const formattedTributes: Tribute[] = tributes.map((tributeData: Record<string, unknown>) => {
    return {
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
  });
  
  // Return paginated response
  return formatPaginatedResponse<TributesListResponse['data']>(
    formattedTributes,
    totalTributes,
    page,
    perPage
  );
};

/**
 * POST handler for creating a new tribute
 * 
 * @route POST /api/v2/tributes
 * @param request The request object
 * @returns Response with created tribute data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Ensure user is authenticated
  const { user, token } = ensureAuthenticatedUser(cookies);
  
  // Parse request body
  const data: TributeCreateRequest = await request.json();
  
  // Validate required fields
  validateRequired(data, ['title', 'deceased_name']);
  
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
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Set author ID to current user if not provided
  if (!data.author_id) {
    data.author_id = user.id;
  }
  
  // Prepare create data
  const createData: Record<string, unknown> = {
    title: data.title,
    deceased_name: data.deceased_name,
    author_id: data.author_id
  };
  
  // Add optional fields if provided
  if (data.slug) createData.slug = data.slug;
  if (data.description) createData.description = data.description;
  if (data.content) createData.content = data.content;
  if (data.featured_image_url) createData.featured_image_url = data.featured_image_url;
  if (data.status) createData.status = data.status;
  if (data.funeral_director_id) createData.funeral_director_id = data.funeral_director_id;
  if (data.birth_date) createData.birth_date = data.birth_date;
  if (data.death_date) createData.death_date = data.death_date;
  if (data.funeral_date) createData.funeral_date = data.funeral_date;
  if (data.funeral_location) createData.funeral_location = data.funeral_location;
  if (data.meta_data) createData.meta_data = data.meta_data;
  if (data.categories) createData.categories = data.categories;
  if (data.tags) createData.tags = data.tags;
  
  // Create tribute in WordPress
  const createdTribute = await wpClient.post<Record<string, unknown>>('wp/v2/tributes', createData);
  
  // Format tribute data
  const formattedTribute: Tribute = {
    id: Number(createdTribute.id),
    title: String(createdTribute.title || ''),
    slug: String(createdTribute.slug || ''),
    description: createdTribute.description ? String(createdTribute.description) : undefined,
    content: createdTribute.content ? String(createdTribute.content) : undefined,
    featured_image_url: createdTribute.featured_image_url ? String(createdTribute.featured_image_url) : undefined,
    status: String(createdTribute.status || 'draft') as 'draft' | 'published' | 'private' | 'archived',
    created_at: String(createdTribute.created_at || ''),
    updated_at: String(createdTribute.updated_at || ''),
    published_at: createdTribute.published_at ? String(createdTribute.published_at) : undefined,
    author_id: Number(createdTribute.author_id),
    author_name: createdTribute.author_name ? String(createdTribute.author_name) : undefined,
    funeral_director_id: createdTribute.funeral_director_id ? Number(createdTribute.funeral_director_id) : undefined,
    funeral_director_name: createdTribute.funeral_director_name ? String(createdTribute.funeral_director_name) : undefined,
    deceased_name: String(createdTribute.deceased_name || ''),
    birth_date: createdTribute.birth_date ? String(createdTribute.birth_date) : undefined,
    death_date: createdTribute.death_date ? String(createdTribute.death_date) : undefined,
    funeral_date: createdTribute.funeral_date ? String(createdTribute.funeral_date) : undefined,
    funeral_location: createdTribute.funeral_location ? String(createdTribute.funeral_location) : undefined,
    meta_data: createdTribute.meta_data as Record<string, unknown> | undefined,
    categories: Array.isArray(createdTribute.categories) ? createdTribute.categories.map(String) : undefined,
    tags: Array.isArray(createdTribute.tags) ? createdTribute.tags.map(String) : undefined
  };
  
  // Return created response
  return formatCreatedResponse<TributeResponse['data']>(formattedTribute, 'Tribute');
};
