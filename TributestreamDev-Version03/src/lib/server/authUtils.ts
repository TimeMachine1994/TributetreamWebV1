/**
 * Authentication Utilities
 * 
 * Utility functions for authentication, authorization, and user management.
 */

import { error, type RequestEvent } from '@sveltejs/kit';
import { forwardRequestToWordPress, createErrorResponse, FUNERAL_API_PATH } from './apiUtils';

// WordPress JWT Auth paths
export const JWT_TOKEN_PATH = '/jwt-auth/v1/token';
export const JWT_TOKEN_VALIDATE_PATH = '/jwt-auth/v1/token/validate';
export const JWT_VALIDATE_PATH = '/jwt-auth/v1/token/validate';

/**
 * Extract JWT token from request headers
 *
 * @param request Request object
 * @returns JWT token or null if not found
 */
export function extractJwtToken(request: Request): string | null {
  return extractTokenFromHeader(request);
}

/**
 * Extract JWT token from request headers (alias for backward compatibility)
 *
 * @param requestOrEvent Request object or RequestEvent
 * @returns JWT token or null if not found
 */
export function extractTokenFromHeader(requestOrEvent: Request | RequestEvent): string | null {
  const request = 'request' in requestOrEvent ? requestOrEvent.request : requestOrEvent;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Ensure request is authenticated
 * 
 * @param event SvelteKit request event
 * @returns JWT token if authenticated
 * @throws Error if not authenticated
 */
export async function ensureAuthenticated(event: RequestEvent): Promise<string> {
  const token = extractJwtToken(event.request);
  
  if (!token) {
    throw error(401, 'Authentication required');
  }
  
  // Validate token
  const isValid = await validateToken(token, event);
  
  if (!isValid) {
    throw error(401, 'Invalid or expired token');
  }
  
  return token;
}

/**
 * Validate JWT token
 * 
 * @param token JWT token
 * @param event SvelteKit request event
 * @returns True if token is valid
 */
export async function validateToken(token: string, event: RequestEvent): Promise<boolean> {
  try {
    const response = await forwardRequestToWordPress(
      event,
      JWT_TOKEN_VALIDATE_PATH,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // If response is successful and status is 200, token is valid
    return response.success && response.status === 200;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Get the user ID from the JWT token
 * 
 * @param event SvelteKit request event
 * @returns User ID if authenticated
 * @throws Error if not authenticated
 */
export async function getAuthenticatedUserId(event: RequestEvent): Promise<number> {
  // This is a simplified implementation
  // In a real-world scenario, you would decode the JWT token and extract the user ID
  // For now, we're just ensuring the user is authenticated
  
  await ensureAuthenticated(event);
  
  // TODO: Implement JWT token decoding to extract user ID
  // This would require using a JWT library to decode the token
  // and extract the user ID from the payload
  
  // For now, we'll just return a placeholder value
  // In a real implementation, you would replace this with actual JWT token decoding
  return 1;
}

/**
 * Check if user has admin privileges
 * 
 * @param userId User ID to check
 * @param event SvelteKit request event
 * @returns True if user is an admin
 */
export async function isUserAdmin(userId: number, event?: RequestEvent): Promise<boolean> {
  try {
    if (!event) {
      // If no event is provided, we can't make the API call
      return false;
    }
    
    // Get the token
    const token = await ensureAuthenticated(event);
    
    // Call the WordPress API to check if the user is an admin
    const response = await forwardRequestToWordPress(
      event,
      `${FUNERAL_API_PATH}/users/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Check if the user has admin role
    if (response.success && response.data) {
      const userData = response.data as { roles?: string[] };
      return Array.isArray(userData.roles) && userData.roles.includes('administrator');
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if user has permission to access a tribute
 * 
 * @param event SvelteKit request event
 * @param tributeId Tribute ID
 * @param requestUserId Optional user ID from request body
 * @returns Object with userId and error response (if any)
 */
export async function checkTributePermission(
  event: RequestEvent,
  tributeId: number,
  requestUserId?: number
): Promise<{ userId: number; errorResponse: Response | null }> {
  try {
    // Use provided requestUserId if available, otherwise get it from the token
    const userId = requestUserId || await getAuthenticatedUserId(event);
    
    // TODO: Implement actual tribute permission check with API call
    // Here we would check if the user owns this tribute or has admin rights
    // Example implementation:
    /*
    const response = await forwardRequestToWordPress(
      event,
      `/tributestream/v1/tributes/${tributeId}/check-permission`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await ensureAuthenticated(event)}`
        }
      }
    );
    
    if (!response.success || !response.data?.has_permission) {
      return {
        userId,
        errorResponse: json(
          createErrorResponse(
            'PERMISSION_DENIED',
            'You do not have permission to access this tribute',
            403
          ),
          { status: 403 }
        )
      };
    }
    */
    
    // For now, we're just ensuring authentication
    return {
      userId,
      errorResponse: null
    };
  } catch (error) {
    // Return the authentication error
    if (error instanceof Response) {
      return {
        userId: 0,
        errorResponse: error
      };
    }
    
    // Handle unexpected errors
    console.error('Error checking tribute permission:', error);
    return {
      userId: 0,
      errorResponse: new Response(
        JSON.stringify(
          createErrorResponse(
            'SERVER_ERROR',
            error instanceof Error ? error.message : 'Server error',
            500
          )
        ),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    };
  }
}