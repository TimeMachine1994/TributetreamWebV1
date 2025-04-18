import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';
import { v4 as uuidv4 } from 'uuid';

/**
 * User registration handler
 * 
 * This endpoint handles user registration requests and forwards them to the WordPress REST API.
 */
export const POST: RequestHandler = async (event) => {
  const { request, getClientAddress } = event;
  // Generate a unique request ID for tracing this request through logs
  const requestId = uuidv4().substring(0, 8);
  const clientIp = getClientAddress();
  console.log(`[AUTH:REGISTER:${requestId}] Registration request received from IP: ${clientIp}`);
  try {
    console.log(`[AUTH:REGISTER:${requestId}] Processing registration request`);
    
    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log(`[AUTH:REGISTER:${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    // Parse the request body
    const userData = await request.json();
    console.log(`[AUTH:REGISTER:${requestId}] Registration attempt for email: ${userData.email}`);
    
    // Log sanitized user data (excluding password)
    const sanitizedUserData = { ...userData };
    if (sanitizedUserData.password) {
      sanitizedUserData.password = '[REDACTED]';
    }
    console.log(`[AUTH:REGISTER:${requestId}] Registration data:`, JSON.stringify(sanitizedUserData, null, 2));
    
    // Make the registration request to the WordPress REST API using SvelteKit's event.fetch
    console.log(`[AUTH:REGISTER:${requestId}] Sending registration request to WordPress at: ${JWT_AUTH_URL}/wp/v2/users/register`);
    
    const startTime = Date.now();
    const response = await event.fetch(`${JWT_AUTH_URL}/wp/v2/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const requestDuration = Date.now() - startTime;
    
    // Log response details
    console.log(`[AUTH:REGISTER:${requestId}] WordPress registration response received in ${requestDuration}ms`);
    console.log(`[AUTH:REGISTER:${requestId}] Response status: ${response.status}`);
    console.log(`[AUTH:REGISTER:${requestId}] Response content type: ${response.headers.get('content-type')}`);
    
    // Log all response headers for debugging
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log(`[AUTH:REGISTER:${requestId}] Response headers:`, JSON.stringify(responseHeaders, null, 2));
    
    // Get response text first to inspect it
    const responseText = await response.text();
    console.log(`[AUTH:REGISTER:${requestId}] Response text (first 150 chars): ${responseText.substring(0, 150)}`);
    console.log(`[AUTH:REGISTER:${requestId}] Response text length: ${responseText.length} bytes`);
    
    // Try to parse as JSON
    let data;
    try {
      console.log(`[AUTH:REGISTER:${requestId}] Attempting to parse response as JSON`);
      data = JSON.parse(responseText);
      console.log(`[AUTH:REGISTER:${requestId}] Successfully parsed JSON response`);
    } catch (error) {
      console.error(`[AUTH:REGISTER:${requestId}] Failed to parse response as JSON:`, error);
      console.log(`[AUTH:REGISTER:${requestId}] Raw response that failed to parse:`, responseText);
      
      const errorResponse = {
        success: false,
        message: 'Failed to parse WordPress response as JSON. The server might be returning HTML instead of JSON.',
        status: response.status
      };
      console.log(`[AUTH:REGISTER:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: 500 });
    }
    
    if (!response.ok) {
      // Return the error response
      console.log(`[AUTH:REGISTER:${requestId}] Registration failed with status ${response.status}`);
      console.log(`[AUTH:REGISTER:${requestId}] Error message:`, data.message || 'Registration failed');
      
      const errorResponse = {
        success: false,
        message: data.message || 'Registration failed',
        status: response.status
      };
      console.log(`[AUTH:REGISTER:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: response.status });
    }
    
    console.log(`[AUTH:REGISTER:${requestId}] Registration successful`);
    
    // Return the success response
    const successResponse = {
      success: true,
      data
    };
    
    console.log(`[AUTH:REGISTER:${requestId}] Returning success response:`, JSON.stringify(successResponse, null, 2));
    return json(successResponse);
  } catch (error) {
    console.error(`[AUTH:REGISTER:${requestId}] Registration error:`, error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[AUTH:REGISTER:${requestId}] Error name: ${error.name}`);
      console.error(`[AUTH:REGISTER:${requestId}] Error message: ${error.message}`);
      console.error(`[AUTH:REGISTER:${requestId}] Error stack: ${error.stack}`);
    } else {
      console.error(`[AUTH:REGISTER:${requestId}] Unknown error type:`, typeof error);
    }
    
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
      status: 500
    };
    
    console.log(`[AUTH:REGISTER:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
    return json(errorResponse, { status: 500 });
  } finally {
    console.log(`[AUTH:REGISTER:${requestId}] Request processing completed`);
  }
};
