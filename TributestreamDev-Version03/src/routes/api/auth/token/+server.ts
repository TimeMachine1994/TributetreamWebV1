/**
 * Authentication Token Endpoint
 * 
 * Authenticates a user with username/password and returns a JWT token.
 * This endpoint proxies requests to WordPress JWT Auth plugin.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse, 
  createSuccessResponse,
  getJsonBody,
  validateRequiredFields
} from '$lib/server/apiUtils';
import { JWT_TOKEN_PATH } from '$lib/server/authUtils';
import type { AuthLoginParams, AuthResponse } from '$lib/server/types';

/**
 * Handle POST /api/auth/token
 * Authenticate user and return JWT token
 */
export const POST: RequestHandler = async (event) => {
  try {
    // Parse request body
    const body = await getJsonBody<AuthLoginParams>(event.request);
    
    if (!body) {
      return json(
        createErrorResponse(
          'INVALID_REQUEST', 
          'Invalid request body, JSON expected', 
          400
        ), 
        { status: 400 }
      );
    }
    
    // Validate required fields
    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ['username', 'password']
    );
    
    if (validationError) {
      return json(
        createErrorResponse('VALIDATION_ERROR', validationError, 400),
        { status: 400 }
      );
    }
    
    // Forward request to WordPress JWT Auth endpoint
    const response = await forwardRequestToWordPress<AuthResponse>(
      event,
      JWT_TOKEN_PATH,
      {
        method: 'POST',
        body: JSON.stringify({
          username: body.username,
          password: body.password
        })
      }
    );
    
    // Handle WordPress API response
    if (!response.success) {
      return json(
        createErrorResponse(
          response.code || 'AUTH_FAILED',
          response.error || 'Authentication failed',
          response.status || 401
        ),
        { status: response.status || 401 }
      );
    }
    
    // Check if response data exists
    if (!response.data) {
      return json(
        createErrorResponse(
          'SERVER_ERROR',
          'Invalid response from authentication server',
          500
        ),
        { status: 500 }
      );
    }
    
    // Return successful login response
    return json(
      createSuccessResponse({
        token: response.data.token,
        user_id: response.data.user_id,
        user_display_name: response.data.user_display_name,
        user_email: response.data.user_email,
        user_nicename: response.data.user_nicename
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in auth token endpoint:', error);
    
    return json(
      createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'Internal server error',
        500
      ),
      { status: 500 }
    );
  }
};