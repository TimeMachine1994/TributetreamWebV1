import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logout handler
 * 
 * This endpoint clears the JWT token cookie.
 */
export const POST: RequestHandler = async ({ cookies, getClientAddress, request }) => {
  // Generate a unique request ID for tracing this request through logs
  const requestId = uuidv4().substring(0, 8);
  const clientIp = getClientAddress();
  console.log(`[AUTH:LOGOUT:${requestId}] Logout request received from IP: ${clientIp}`);
  
  try {
    console.log(`[AUTH:LOGOUT:${requestId}] Processing logout request`);
    
    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log(`[AUTH:LOGOUT:${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    // Check if the token exists before deletion
    const existingToken = cookies.get('wp_jwt_token');
    console.log(`[AUTH:LOGOUT:${requestId}] JWT token exists before logout: ${!!existingToken}`);
    if (existingToken) {
      console.log(`[AUTH:LOGOUT:${requestId}] Token length: ${existingToken.length} characters`);
    }
    // Clear the JWT token cookie
    console.log(`[AUTH:LOGOUT:${requestId}] Deleting JWT token cookie`);
    cookies.delete('wp_jwt_token', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict'
    });
    
    // Verify the cookie was deleted
    const tokenAfterDeletion = cookies.get('wp_jwt_token');
    console.log(`[AUTH:LOGOUT:${requestId}] JWT token exists after deletion attempt: ${!!tokenAfterDeletion}`);
    
    const response = {
      success: true,
      message: 'Logged out successfully'
    };
    
    console.log(`[AUTH:LOGOUT:${requestId}] Logout successful, returning response:`, JSON.stringify(response, null, 2));
    return json(response);
  } catch (error) {
    console.error(`[AUTH:LOGOUT:${requestId}] Logout error:`, error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[AUTH:LOGOUT:${requestId}] Error name: ${error.name}`);
      console.error(`[AUTH:LOGOUT:${requestId}] Error message: ${error.message}`);
      console.error(`[AUTH:LOGOUT:${requestId}] Error stack: ${error.stack}`);
    } else {
      console.error(`[AUTH:LOGOUT:${requestId}] Unknown error type:`, typeof error);
    }
    
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed',
      status: 500
    };
    
    console.log(`[AUTH:LOGOUT:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
    return json(errorResponse, { status: 500 });
  } finally {
    console.log(`[AUTH:LOGOUT:${requestId}] Request processing completed`);
  }
};
