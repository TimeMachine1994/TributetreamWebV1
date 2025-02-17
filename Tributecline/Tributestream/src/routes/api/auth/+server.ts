
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServerApiUrl, WP_ENDPOINTS, type WPApiError } from '$lib/config/wordpress.server';
import type { ApiResponse, LoginResponse } from '$lib/types/api';

/**
 * Login endpoint that authenticates against WordPress JWT auth
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json<ErrorResponse>({
        success: false,
        message: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 });
    }

    // Make request to WordPress JWT auth endpoint
    const response = await fetch(getServerApiUrl(WP_ENDPOINTS.AUTH.TOKEN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const wpError = data as WPApiError;
      return json<ErrorResponse>({
        success: false,
        message: wpError.message || 'Authentication failed',
        code: wpError.code || 'AUTH_FAILED'
      }, { status: response.status });
    }

    // Return successful response with token and user data
    return json<SuccessResponse<LoginResponse>>({
      success: true,
      data: {
        token: data.token,
        user_email: data.user_email,
        user_nicename: data.user_nicename,
        user_display_name: data.user_display_name,
        user_id: data.user_id,
        roles: data.roles || []
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return json<ErrorResponse>({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
};

/**
 * Token validation endpoint
 */
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return json<ErrorResponse>({
        success: false,
        message: 'No token provided',
        code: 'MISSING_TOKEN'
      }, { status: 401 });
    }

    // Make request to WordPress JWT token validation endpoint
    const response = await fetch(getServerApiUrl(WP_ENDPOINTS.AUTH.VALIDATE), {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const wpError = data as WPApiError;
      return json<ErrorResponse>({
        success: false,
        message: wpError.message || 'Token validation failed',
        code: wpError.code || 'INVALID_TOKEN'
      }, { status: response.status });
    }

    return json<SuccessResponse<{ valid: true }>>({
      success: true,
      data: { valid: true }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return json<ErrorResponse>({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
};