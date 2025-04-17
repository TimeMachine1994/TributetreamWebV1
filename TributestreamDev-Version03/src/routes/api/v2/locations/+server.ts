/**
 * Locations API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatPaginatedResponse,
  formatCreatedResponse,
  ensureAuthenticatedUser,
  createWpApiClient,
  parseQueryParams,
  getPaginationParams,
  getSortingParams
} from '../utils';
import { 
  validateRequired,
  validatePagination
} from '../utils/validation';
import type { 
  Location, 
  LocationCreateRequest, 
  LocationsListResponse, 
  LocationResponse,
  LocationListQueryParams
} from '../types/locations';

/**
 * GET handler for retrieving a list of locations
 * 
 * @route GET /api/v2/locations
 * @param request The request object
 * @returns Response with paginated list of locations
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Parse query parameters
  const queryParams = parseQueryParams(url.searchParams) as LocationListQueryParams;
  const { page, per_page } = getPaginationParams(queryParams);
  const { sort_by, sort_order } = getSortingParams(queryParams, 'location_name', 'asc');
  
  // Validate pagination parameters
  validatePagination(page, per_page);
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('per_page', String(per_page));
  params.append('sort_by', sort_by);
  params.append('sort_order', sort_order);
  
  // Add tribute_id filter if provided
  if (queryParams.tribute_id) {
    params.append('tribute_id', String(queryParams.tribute_id));
  }
  
  // Get locations from WordPress API
  const locationsResponse = await wpClient.get<{
    locations: Record<string, unknown>[];
    total?: number;
    headers?: { 'X-WP-Total'?: string };
  }>(`wp/v2/locations?${params.toString()}`);
  
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

/**
 * POST handler for creating a new location
 * 
 * @route POST /api/v2/locations
 * @param request The request object
 * @returns Response with created location data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Parse request body
  const data: LocationCreateRequest = await request.json();
  
  // Validate required fields
  validateRequired(data, ['tribute_id', 'location_name', 'location_address']);
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Verify tribute exists
  const tributeResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/tributes/${data.tribute_id}`)
    .catch(() => null);
  
  if (!tributeResponse) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Tribute not found',
        status: 404
      }
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Prepare create data
  const createData: Record<string, unknown> = {
    tribute_id: data.tribute_id,
    location_name: data.location_name,
    location_address: data.location_address
  };
  
  // Add optional fields if provided
  if (data.sort_order !== undefined) {
    createData.sort_order = data.sort_order;
  }
  
  // Create location in WordPress
  const createdLocation = await wpClient.post<Record<string, unknown>>('wp/v2/locations', createData);
  
  // Format location data
  const formattedLocation: Location = {
    location_id: Number(createdLocation.location_id),
    tribute_id: Number(createdLocation.tribute_id),
    location_name: String(createdLocation.location_name || ''),
    location_address: String(createdLocation.location_address || ''),
    sort_order: Number(createdLocation.sort_order || 0),
    created_at: createdLocation.created_at ? String(createdLocation.created_at) : undefined,
    updated_at: createdLocation.updated_at ? String(createdLocation.updated_at) : undefined
  };
  
  // Return created response
  return formatCreatedResponse<LocationResponse['data']>(formattedLocation, 'Location');
};
