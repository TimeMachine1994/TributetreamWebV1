import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL, AUTH_TOKEN_EXPIRY } from '$lib/utils/env';
import type { JWTAuthResponse, LoginCredentials } from '$lib/types/auth.types';

/**
 * Login handler
 * 
 * This endpoint handles login requests and sets the JWT token as an HttpOnly cookie.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse the request body
    const credentials: LoginCredentials = await request.json();
    
    // Make the login request to the WordPress REST API
    const response = await fetch(`${JWT_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    // Parse the response
    const data: JWTAuthResponse = await response.json();
    
    if (!response.ok) {
      // Return the error response
      return json({
        success: false,
        message: data.token || 'Authentication failed',
        status: response.status
      }, { status: response.status });
    }
    
    // Set the JWT token as an HttpOnly cookie
    cookies.set('wp_jwt_token', data.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: AUTH_TOKEN_EXPIRY // 7 days in seconds
    });
    
    // Return the user data (without the token)
    return json({
      success: true,
      user: {
        email: data.user_email,
        nicename: data.user_nicename,
        displayName: data.user_display_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
      status: 500
    }, { status: 500 });
  }
};