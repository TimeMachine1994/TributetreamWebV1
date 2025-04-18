import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WP_API_URL } from '$lib/utils/env';

/**
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
    
    // Build the WordPress API URL
    const wpApiUrl = new URL(`${WP_API_URL}/funeral/v2/tribute-pages/${id}`);
    
    // Set up headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // Add authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString(), {
      method: 'GET',
      headers
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to fetch tribute',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response
    return json({
      success: true,
      data: data.data
    });
  } catch (error) {
    console.error('Error fetching tribute:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch tribute',
      status: 500
    }, { status: 500 });
  }
};

/**
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
    const response = await fetch(`${WP_API_URL}/funeral/v2/tribute-pages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to update tribute',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response
    return json({
      success: true,
      data: data.data
    });
  } catch (error) {
    console.error('Error updating tribute:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update tribute',
      status: 500
    }, { status: 500 });
  }
};

/**
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
    const response = await fetch(`${WP_API_URL}/funeral/v2/tribute-pages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not OK, return an error
    if (!response.ok) {
      return json({
        success: false,
        message: data.message || 'Failed to delete tribute',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response
    return json({
      success: true,
      data: data.data
    });
  } catch (error) {
    console.error('Error deleting tribute:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete tribute',
      status: 500
    }, { status: 500 });
  }
};