/**
 * User Registration Endpoint
 * 
 * Handles new user registration by forwarding registration data to WordPress.
 * 
 * POST /api/auth/register
 * Body: { username: string, email: string, password: string, meta?: Record<string, unknown> }
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { 
  forwardRequestToWordPress, 
  createErrorResponse,
  createSuccessResponse,
  TRIBUTESTREAM_API_PATH
} from '$lib/server/apiUtils';
import type { 
  RegisterUserParams, 
  RegisterUserResponse 
} from '$lib/server/types';

/**
 * Handle POST requests to register a new user
 */
export async function POST(event: RequestEvent) {
  try {
    // Parse the request body
    const body = await event.request.json() as RegisterUserParams;
    
    // Validate required fields
    if (!body.username) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Username is required',
          400
        ),
        { status: 400 }
      );
    }
    
    if (!body.email) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Email is required',
          400
        ),
        { status: 400 }
      );
    }
    
    if (!body.password) {
      return json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Password is required',
          400
        ),
        { status: 400 }
      );
    }
    
    // Forward to WordPress registration endpoint
    const response = await forwardRequestToWordPress<RegisterUserResponse>(
      event,
      `${TRIBUTESTREAM_API_PATH}/register`,
      {
        method: 'POST',
        body: JSON.stringify({
          username: body.username,
          email: body.email,
          password: body.password,
          meta: body.meta
        })
      }
    );
    
    // If registration failed, return the error
    if (!response.success) {
      // WordPress may return specific error messages we want to forward
      const errorMsg = response.error || 'Registration failed';
      const statusCode = response.status || 500;
      
      return json(
        createErrorResponse(
          'REGISTRATION_ERROR',
          errorMsg,
          statusCode
        ),
        { status: statusCode }
      );
    }
    
    // Return successful registration response
    return json(
      createSuccessResponse({
        user_id: response.data?.user_id || 0,
        token: response.data?.token || '',
        user_display_name: response.data?.user_display_name || '',
        user_email: response.data?.user_email || ''
      }),
      { status: 201 }
    );
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error in user registration endpoint:', error);
    
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