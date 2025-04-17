/**
 * Locations by tribute ID API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  parseQueryParams,
  getPaginationParams,
  getSortingParams
} from '../../../utils';
import { 
  validatePagination
} from '../../../utils/validation';
import type { 
  Location, 
  LocationsListResponse,
  LocationListQueryParams
} from '../../../types/locations';
import { ApiErrors } from '../../../utils/error-handler';

/**
 * GET handler for retrieving locations by tribute ID
 * 
 * @route GET /api/v2/tributes/:id/locations
 * @param request The request object
 * @returns Response with paginated list of locations for the tribute
 */
export const GET: RequestHandler = async ({ params, url, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get tribute ID from params
  const tributeId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Verify tribute exists
  const tributeResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/tributes/${tributeId}`)
    .catch(() => null);
  
  if (!tributeResponse) {
    throw ApiErrors.notFound('Tribute');
  }
  
  // Parse query parameters
  const queryParams = parseQueryParams(url.searchParams) as LocationListQueryParams;
  const { page, per_page } = getPaginationParams(queryParams);
  const { sort_by, sort_order } = getSortingParams(queryParams, 'location_name', 'asc');
  
  // Validate pagination parameters
  validatePagination(page, per_page);
  
  // Build query parameters
  const queryString = new URLSearchParams();
  queryString.append('page', String(page));
  queryString.append('per_page', String(per_page));
  queryString.append('sort_by', sort_by);
  queryString.append('sort_order', sort_order);
  queryString.append('tribute_id', tributeId);
  
  // Get locations from WordPress API
  const locationsResponse = await wpClient.get<{
    locations: Record<string, unknown>[];
    total?: number;
    headers?: { 'X-WP-Total'?: string };
  }>(`wp/v2/locations?${queryString.toString()}`);
  
  // Extract locations array and total count
  const locations = Array.isArray(locationsResponse) ? locationsResponse : (locationsResponse.locations || []);
  const totalLocations = locationsResponse.total || 
                     (locationsResponse.headers && locationsResponse.headers['X-WP-Total'] ? 
                      parseInt(locationsResponse.headers['X-WP-Total'], 10) : 
                      locations.length);
  
  // Format location data
  const formattedLocations: Location[] = locations.map((locationData: Record<string, unknown>) => {
    return {
      location_id: Number(locationData.location_id),
      tribute_id: Number(locationData.tribute_id),
      location_name: String(locationData.location_name || ''),
      location_address: String(locationData.location_address || ''),
      sort_order: Number(locationData.sort_order || 0),
      created_at: locationData.created_at ? String(locationData.created_at) : undefined,
      updated_at: locationData.updated_at ? String(locationData.updated_at) : undefined
    };
  });
  
  // Return paginated response
  return formatPaginatedResponse<LocationsListResponse['data']>(
    formattedLocations,
    totalLocations,
    page,
    per_page
  );
};
