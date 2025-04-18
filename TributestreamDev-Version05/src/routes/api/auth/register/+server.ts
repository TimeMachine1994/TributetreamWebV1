import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';

/**
 * User registration handler
 * 
 * This endpoint handles user registration requests and forwards them to the WordPress REST API.
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the request body
    const userData = await request.json();
    
    // Make the registration request to the WordPress REST API
    const response = await fetch(`${JWT_AUTH_URL}/wp/v2/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      // Return the error response
      return json({
        success: false,
        message: data.message || 'Registration failed',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the success response
    return json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
      status: 500
    }, { status: 500 });
  }
};