import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';
import type { JWTValidationResponse } from '$lib/types/auth.types';

/**
 * Token validation handler
 * 
 * This endpoint validates the JWT token.
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
  try {
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    
    if (!token) {
      return json({
        success: false,
        message: 'No token found',
        status: 401
      }, { status: 401 });
    }
    
    // Make the validation request to the WordPress REST API
    const response = await fetch(`${JWT_AUTH_URL}/token/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Parse the response
    const data: JWTValidationResponse = await response.json();
    
    if (!response.ok) {
      // Clear the invalid token
      cookies.delete('wp_jwt_token', {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });
      
      return json({
        success: false,
        message: 'Invalid token',
        status: response.status
      }, { status: response.status });
    }
    
    // Token is valid
    return json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Token validation error:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Token validation failed',
      status: 500
    }, { status: 500 });
  }
};