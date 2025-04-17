/**
 * Location by ID API endpoints for the API v2
 */
import type { RequestHandler } from './$types';
import { 
  formatResponse,
  formatUpdatedResponse,
  formatDeletedResponse,
  ensureAuthenticatedUser,
  createWpApiClient
} from '../../utils';
import type { 
  Location, 
  LocationUpdateRequest, 
  LocationResponse 
} from '../../types/locations';
import { ApiErrors } from '../../utils/error-handler';

/**
 * GET handler for retrieving a location by ID
 * 
 * @route GET /api/v2/locations/:id
 * @param request The request object
 * @returns Response with location data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get location ID from params
  const locationId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get location data from WordPress API
  const locationData = await wpClient.get<Record<string, unknown>>(`wp/v2/locations/${locationId}`);
  
  // Check if location exists
  if (!locationData || !locationData.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Format location data
  const formattedLocation: Location = {
    location_id: Number(locationData.location_id),
    tribute_id: Number(locationData.tribute_id),
    location_name: String(locationData.location_name || ''),
    location_address: String(locationData.location_address || ''),
    sort_order: Number(locationData.sort_order || 0),
    created_at: locationData.created_at ? String(locationData.created_at) : undefined,
    updated_at: locationData.updated_at ? String(locationData.updated_at) : undefined
  };
  
  // Return response
  return formatResponse<LocationResponse['data']>(formattedLocation);
};

/**
 * PUT handler for updating a location by ID
 * 
 * @route PUT /api/v2/locations/:id
 * @param request The request object
 * @returns Response with updated location data
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get location ID from params
  const locationId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing location to check if it exists
  const existingLocation = await wpClient.get<Record<string, unknown> | null>(`wp/v2/locations/${locationId}`)
    .catch(() => null);
  
  // Check if location exists
  if (!existingLocation || !existingLocation.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Parse request body
  const data: LocationUpdateRequest = await request.json();
  
  // Prepare update data
  const updateData: Record<string, unknown> = {};
  
  // Only include fields that are provided
  if (data.tribute_id !== undefined) {
    // Verify tribute exists if tribute_id is provided
    const tributeResponse = await wpClient.get<Record<string, unknown> | null>(`wp/v2/tributes/${data.tribute_id}`)
      .catch(() => null);
    
    if (!tributeResponse) {
      throw ApiErrors.notFound('Tribute');
    }
    
    updateData.tribute_id = data.tribute_id;
  }
  
  if (data.location_name !== undefined) updateData.location_name = data.location_name;
  if (data.location_address !== undefined) updateData.location_address = data.location_address;
  if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
  
  // Update location in WordPress
  const updatedLocation = await wpClient.put<Record<string, unknown>>(`wp/v2/locations/${locationId}`, updateData);
  
  // Format location data
  const formattedLocation: Location = {
    location_id: Number(updatedLocation.location_id),
    tribute_id: Number(updatedLocation.tribute_id),
    location_name: String(updatedLocation.location_name || ''),
    location_address: String(updatedLocation.location_address || ''),
    sort_order: Number(updatedLocation.sort_order || 0),
    created_at: updatedLocation.created_at ? String(updatedLocation.created_at) : undefined,
    updated_at: updatedLocation.updated_at ? String(updatedLocation.updated_at) : undefined
  };
  
  // Return updated response
  return formatUpdatedResponse<LocationResponse['data']>(formattedLocation, 'Location');
};

/**
 * DELETE handler for deleting a location by ID
 * 
 * @route DELETE /api/v2/locations/:id
 * @param request The request object
 * @returns Response with deleted location ID
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  // Ensure user is authenticated
  const { token } = ensureAuthenticatedUser(cookies);
  
  // Get location ID from params
  const locationId = params.id;
  
  // Create WordPress API client
  const wpClient = createWpApiClient(token);
  
  // Get existing location to check if it exists
  const existingLocation = await wpClient.get<Record<string, unknown> | null>(`wp/v2/locations/${locationId}`)
    .catch(() => null);
  
  // Check if location exists
  if (!existingLocation || !existingLocation.location_id) {
    throw ApiErrors.notFound('Location');
  }
  
  // Delete location in WordPress
  await wpClient.delete(`wp/v2/locations/${locationId}?force=true`);
  
  // Return deleted response
  return formatDeletedResponse(locationId, 'Location');
};
