import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_BASE, createWpHeaders, formatErrorResponse, handleWpResponse } from '$lib/utils/wp-api';
import type { Tribute, SuccessResponse } from '$lib/types/tribute.types';

/**
 * GET /api/wp/tributes/[id]
 * Get a single tribute by ID
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // Get the tribute ID from the params
    const { id } = params;
    
    if (!id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
      method: 'GET',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<Tribute>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to fetch tribute'),
      { status: 500 }
    );
  }
};

/**
 * PUT /api/wp/tributes/[id]
 * Update a tribute
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // If no token, return unauthorized
    if (!token) {
      return json({
        success: false,
        message: 'Unauthorized',
        status: 401
      }, { status: 401 });
    }
    
    // Get the tribute ID from the params
    const { id } = params;
    
    if (!id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Get the request body
    const body = await request.json();
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
      method: 'PUT',
      headers: createWpHeaders(token),
      body: JSON.stringify(body)
    });
    
    const data = await handleWpResponse<SuccessResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to update tribute'),
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/wp/tributes/[id]
 * Delete a tribute
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    // If no token, return unauthorized
    if (!token) {
      return json({
        success: false,
        message: 'Unauthorized',
        status: 401
      }, { status: 401 });
    }
    
    // Get the tribute ID from the params
    const { id } = params;
    
    if (!id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tributes/${id}`, {
      method: 'DELETE',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<SuccessResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to delete tribute'),
      { status: 500 }
    );
  }
};