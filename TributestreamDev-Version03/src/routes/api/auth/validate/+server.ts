/**
 * JWT Token Validation Endpoint
 * 
 * Validates a JWT token by forwarding it to WordPress JWT Auth validation endpoint.
 * 
 * POST /api/auth/validate
 * Headers: { Authorization: "Bearer <token>" }
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  createSuccessResponse
} from '$lib/server/apiUtils';
import { 
  JWT_VALIDATE_PATH, 
  extractTokenFromHeader 
} from '$lib/server/authUtils';
import type { AuthValidationResponse } from '$lib/server/types';

/**
 * Handle POST requests to validate a JWT token
 */
export async function POST(event: RequestEvent) {
  try {
    // Get token from Authorization header
    const token = extractTokenFromHeader(event);
    
    // Check if token exists
    if (!token) {
      return json(
        createErrorResponse(
          'AUTHENTICATION_REQUIRED',
          'No token provided',
          401
        ),
        { status: 401 }
      );
    }
    
    // Forward to WordPress JWT validation endpoint
    const response = await forwardRequestToWordPress<AuthValidationResponse>(
      event,
      JWT_VALIDATE_PATH,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // If the validation failed, return the error
    if (!response.success || response.data?.code !== 'jwt_auth_valid_token') {
      const errorMsg = response.error || 'Token validation failed';
      const statusCode = response.status || 401;
      
      return json(
        createErrorResponse(
          'INVALID_TOKEN',
          errorMsg,
          statusCode
        ),
        { status: statusCode }
      );
    }
    
    // Return successful validation response
    return json(
      createSuccessResponse({
        valid: true,
        code: response.data.code,
        status: response.data.data.status
      }),
      { status: 200 }
    );
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error in token validation endpoint:', error);
    
    return json(
      createErrorResponse(
        'SERVER_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      ),
      { status: 500 }
    );
  }
}