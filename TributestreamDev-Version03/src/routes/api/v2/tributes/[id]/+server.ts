/**
 * Tribute by ID API endpoint for the API v2
 */
import type { RequestHandler } from './$types';
import {
  ApiErrors,
  formatResponse,
  ensureAuthenticatedUser,
  ensureResourceAccess
} from '../../utils';
import { createWpApiClient } from '../../utils/wp-api-client';
import type { Tribute, TributeResponse } from '../../types/tributes';
import { formatUpdatedResponse, formatDeletedResponse } from '../../utils/response-formatter';

/**
 * GET handler for retrieving a tribute by ID
 * 
 * @route GET /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with tribute data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    const tributeId = params.id;
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get tribute data
    const tribute = await wpClient.get(`tributestream/v1/tributes/${tributeId}`);
    
    // Ensure user has access to this tribute
    ensureResourceAccess(user, tribute.created_by_user_id);
    
    // Return response
    return formatResponse<Tribute>(tribute);
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * PUT handler for updating a tribute
 * 
 * @route PUT /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with updated tribute data
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    const tributeId = params.id;
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get tribute data to check access
    const tribute = await wpClient.get(`tributestream/v1/tributes/${tributeId}`);
    
    // Ensure user has access to this tribute
    ensureResourceAccess(user, tribute.created_by_user_id);
    
    // Parse request body
    const data = await request.json();
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    // Only allow updating certain fields
    if (data.point_of_contact_user_id) updateData.point_of_contact_user_id = data.point_of_contact_user_id;
    if (data.loved_ones_name) updateData.loved_ones_name = data.loved_ones_name;
    if (data.slugified_name) updateData.slugified_name = data.slugified_name;
    if (data.page_html !== undefined) updateData.page_html = data.page_html;
    if (data.loved_ones_dob) updateData.loved_ones_dob = data.loved_ones_dob;
    if (data.loved_ones_dod) updateData.loved_ones_dod = data.loved_ones_dod;
    
    // Update tribute
    const updatedTribute = await wpClient.put(`tributestream/v1/tributes/${tributeId}`, updateData);
    
    // Return updated response
    return formatUpdatedResponse<Tribute>(updatedTribute, 'Tribute');
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};

/**
 * DELETE handler for deleting a tribute
 * 
 * @route DELETE /api/v2/tributes/:id
 * @param request The request object
 * @returns Response with deleted tribute ID
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  try {
    // Ensure user is authenticated
    const { user, token } = ensureAuthenticatedUser(cookies);
    
    const tributeId = params.id;
    
    // Create WordPress API client
    const wpClient = createWpApiClient(token);
    
    // Get tribute data to check access
    const tribute = await wpClient.get(`tributestream/v1/tributes/${tributeId}`);
    
    // Ensure user has access to this tribute
    ensureResourceAccess(user, tribute.created_by_user_id);
    
    // Delete tribute
    await wpClient.delete(`tributestream/v1/tributes/${tributeId}`);
    
    // Return deleted response
    return formatDeletedResponse(tributeId, 'Tribute');
  } catch (error) {
    // Re-throw errors
    throw error;
  }
};