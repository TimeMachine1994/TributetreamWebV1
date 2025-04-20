import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_BASE, createWpHeaders, formatErrorResponse, handleWpResponse } from '$lib/utils/wp-api';
import type { TributeExtendedData, SuccessResponse } from '$lib/types/tribute.types';

/**
 * GET /api/wp/tribute-data/[tribute_id]
 * Get extended tribute data
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
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
    const { tribute_id } = params;
    
    if (!tribute_id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tribute-data/${tribute_id}`, {
      method: 'GET',
      headers: createWpHeaders(token)
    });
    
    const data = await handleWpResponse<TributeExtendedData>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to fetch tribute data'),
      { status: 500 }
    );
  }
};

/**
 * POST /api/wp/tribute-data/[tribute_id]
 * Create or replace extended tribute data
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
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
    const { tribute_id } = params;
    
    if (!tribute_id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Get the request body
    const body = await request.json();
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tribute-data/${tribute_id}`, {
      method: 'POST',
      headers: createWpHeaders(token),
      body: JSON.stringify(body)
    });
    
    const data = await handleWpResponse<SuccessResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to create tribute data'),
      { status: 500 }
    );
  }
};

/**
 * PUT /api/wp/tribute-data/[tribute_id]
 * Update extended tribute data (partial update)
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
    const { tribute_id } = params;
    
    if (!tribute_id) {
      return json({
        success: false,
        message: 'Tribute ID is required',
        status: 400
      }, { status: 400 });
    }
    
    // Get the request body
    const body = await request.json();
    
    // Make the request to the WordPress API
    const response = await fetch(`${WP_API_BASE}/tribute-data/${tribute_id}`, {
      method: 'PUT',
      headers: createWpHeaders(token),
      body: JSON.stringify(body)
    });
    
    const data = await handleWpResponse<SuccessResponse>(response);
    
    return json(data);
  } catch (error) {
    return json(
      formatErrorResponse(error, 'Failed to update tribute data'),
      { status: 500 }
    );
  }
};