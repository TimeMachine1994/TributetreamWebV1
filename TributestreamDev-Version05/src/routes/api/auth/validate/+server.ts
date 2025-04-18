import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';
import type { JWTValidationResponse } from '$lib/types/auth.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Token validation handler
 * 
 * This endpoint validates the JWT token.
 */
export const POST: RequestHandler = async (event) => {
  const { cookies, request, getClientAddress } = event;
  // Generate a unique request ID for tracing this request through logs
  const requestId = uuidv4().substring(0, 8);
  const clientIp = getClientAddress();
  console.log(`[AUTH:VALIDATE:${requestId}] Token validation request received from IP: ${clientIp}`);
  try {
    console.log(`[AUTH:VALIDATE:${requestId}] Processing token validation request`);
    
    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log(`[AUTH:VALIDATE:${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    // Get the JWT token from the cookie
    const token = cookies.get('wp_jwt_token');
    console.log(`[AUTH:VALIDATE:${requestId}] JWT token exists: ${!!token}`);
    
    if (token) {
      console.log(`[AUTH:VALIDATE:${requestId}] Token length: ${token.length} characters`);
      // Log a masked version of the token for debugging (first and last 10 chars)
      if (token.length > 20) {
        const maskedToken = `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
        console.log(`[AUTH:VALIDATE:${requestId}] Token preview: ${maskedToken}`);
      }
    }
    
    if (!token) {
      console.log(`[AUTH:VALIDATE:${requestId}] No token found in cookies`);
      const errorResponse = {
        success: false,
        message: 'No token found',
        status: 401
      };
      console.log(`[AUTH:VALIDATE:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: 401 });
    }
    
    // Make the validation request to the WordPress REST API using SvelteKit's event.fetch
    console.log(`[AUTH:VALIDATE:${requestId}] Sending validation request to WordPress at: ${JWT_AUTH_URL}/token/validate`);
    
    const startTime = Date.now();
    const response = await event.fetch(`${JWT_AUTH_URL}/token/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const requestDuration = Date.now() - startTime;
    
    // Log response details
    console.log(`[AUTH:VALIDATE:${requestId}] WordPress validation response received in ${requestDuration}ms`);
    console.log(`[AUTH:VALIDATE:${requestId}] Response status: ${response.status}`);
    console.log(`[AUTH:VALIDATE:${requestId}] Response content type: ${response.headers.get('content-type')}`);
    
    // Log all response headers for debugging
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log(`[AUTH:VALIDATE:${requestId}] Response headers:`, JSON.stringify(responseHeaders, null, 2));
    
    // Get response text first to inspect it
    const responseText = await response.text();
    console.log(`[AUTH:VALIDATE:${requestId}] Response text (first 150 chars): ${responseText.substring(0, 150)}`);
    console.log(`[AUTH:VALIDATE:${requestId}] Response text length: ${responseText.length} bytes`);
    
    // Try to parse as JSON
    let data: JWTValidationResponse;
    try {
      console.log(`[AUTH:VALIDATE:${requestId}] Attempting to parse response as JSON`);
      data = JSON.parse(responseText) as JWTValidationResponse;
      console.log(`[AUTH:VALIDATE:${requestId}] Successfully parsed JSON response`);
    } catch (error) {
      console.error(`[AUTH:VALIDATE:${requestId}] Failed to parse response as JSON:`, error);
      console.log(`[AUTH:VALIDATE:${requestId}] Raw response that failed to parse:`, responseText);
      
      const errorResponse = {
        success: false,
        message: 'Failed to parse WordPress response as JSON. The server might be returning HTML instead of JSON.',
        status: response.status
      };
      console.log(`[AUTH:VALIDATE:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: 500 });
    }
    
    if (!response.ok) {
      console.log(`[AUTH:VALIDATE:${requestId}] Token validation failed with status ${response.status}`);
      console.log(`[AUTH:VALIDATE:${requestId}] Error data:`, JSON.stringify(data, null, 2));
      
      // Clear the invalid token
      console.log(`[AUTH:VALIDATE:${requestId}] Clearing invalid token cookie`);
      cookies.delete('wp_jwt_token', {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });
      
      // Verify the cookie was deleted
      const tokenAfterDeletion = cookies.get('wp_jwt_token');
      console.log(`[AUTH:VALIDATE:${requestId}] JWT token exists after deletion attempt: ${!!tokenAfterDeletion}`);
      
      const errorResponse = {
        success: false,
        message: 'Invalid token',
        status: response.status
      };
      console.log(`[AUTH:VALIDATE:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: response.status });
    }
    
    console.log(`[AUTH:VALIDATE:${requestId}] Token validation successful`);
    
    // Token is valid
    const successResponse = {
      success: true,
      message: 'Token is valid'
    };
    
    console.log(`[AUTH:VALIDATE:${requestId}] Returning success response:`, JSON.stringify(successResponse, null, 2));
    return json(successResponse);
  } catch (error) {
    console.error(`[AUTH:VALIDATE:${requestId}] Token validation error:`, error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[AUTH:VALIDATE:${requestId}] Error name: ${error.name}`);
      console.error(`[AUTH:VALIDATE:${requestId}] Error message: ${error.message}`);
      console.error(`[AUTH:VALIDATE:${requestId}] Error stack: ${error.stack}`);
    } else {
      console.error(`[AUTH:VALIDATE:${requestId}] Unknown error type:`, typeof error);
    }
    
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Token validation failed',
      status: 500
    };
    
    console.log(`[AUTH:VALIDATE:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
    return json(errorResponse, { status: 500 });
  } finally {
    console.log(`[AUTH:VALIDATE:${requestId}] Request processing completed`);
  }
};
