import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL, AUTH_TOKEN_EXPIRY } from '$lib/utils/env';
import type { JWTAuthResponse, LoginCredentials } from '$lib/types/auth.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Login handler
 * 
 * This endpoint handles login requests and sets the JWT token as an HttpOnly cookie.
 * Uses SvelteKit's event.fetch for better handling of requests within the application.
 */
export const POST: RequestHandler = async (event) => {
  const { request, cookies, getClientAddress } = event;
  // Generate a unique request ID for tracing this request through logs
  const requestId = uuidv4().substring(0, 8);
  const clientIp = getClientAddress();
  console.log(`[AUTH:LOGIN:${requestId}] Request received from IP: ${clientIp}`);
  try {
    console.log(`[AUTH:LOGIN:${requestId}] Processing login request`);
    
    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log(`[AUTH:LOGIN:${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    // Parse the request body
    const credentials: LoginCredentials = await request.json();
    console.log(`[AUTH:LOGIN:${requestId}] Login attempt for username: ${credentials.username}`);
    
    // Make the login request to the WordPress REST API using SvelteKit's event.fetch
    console.log(`[AUTH:LOGIN:${requestId}] Attempting to authenticate with WordPress at: ${JWT_AUTH_URL}/token`);
    
    const startTime = Date.now();
    const response = await event.fetch(`${JWT_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    const requestDuration = Date.now() - startTime;
    
    // Log response details
    console.log(`[AUTH:LOGIN:${requestId}] WordPress auth response received in ${requestDuration}ms`);
    console.log(`[AUTH:LOGIN:${requestId}] Response status: ${response.status}`);
    console.log(`[AUTH:LOGIN:${requestId}] Response content type: ${response.headers.get('content-type')}`);
    
    // Log all response headers for debugging
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log(`[AUTH:LOGIN:${requestId}] Response headers:`, JSON.stringify(responseHeaders, null, 2));
    
    // Get response text first to inspect it
    const responseText = await response.text();
    console.log(`[AUTH:LOGIN:${requestId}] Response text (first 150 chars): ${responseText.substring(0, 150)}`);
    console.log(`[AUTH:LOGIN:${requestId}] Response text length: ${responseText.length} bytes`);
    
    // Try to parse as JSON
    let data: JWTAuthResponse;
    try {
      console.log(`[AUTH:LOGIN:${requestId}] Attempting to parse response as JSON`);
      data = JSON.parse(responseText) as JWTAuthResponse;
      console.log(`[AUTH:LOGIN:${requestId}] Successfully parsed JSON response`);
    } catch (error) {
      console.error(`[AUTH:LOGIN:${requestId}] Failed to parse response as JSON:`, error);
      console.log(`[AUTH:LOGIN:${requestId}] Raw response that failed to parse:`, responseText);
      const errorResponse = {
        success: false,
        message: 'Failed to parse WordPress response as JSON. The server might be returning HTML instead of JSON.',
        status: response.status
      };
      console.log(`[AUTH:LOGIN:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: 500 });
    }
    
    if (!response.ok) {
      // Return the error response
      console.log(`[AUTH:LOGIN:${requestId}] Authentication failed with status ${response.status}`);
      console.log(`[AUTH:LOGIN:${requestId}] Error message:`, data.token || 'Authentication failed');
      
      const errorResponse = {
        success: false,
        message: data.token || 'Authentication failed',
        status: response.status
      };
      console.log(`[AUTH:LOGIN:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
      return json(errorResponse, { status: response.status });
    }
    
    console.log(`[AUTH:LOGIN:${requestId}] Authentication successful for user: ${data.user_nicename}`);
    
    // Set the JWT token as an HttpOnly cookie
    console.log(`[AUTH:LOGIN:${requestId}] Setting JWT token cookie with expiry: ${AUTH_TOKEN_EXPIRY} seconds`);
    console.log(`[AUTH:LOGIN:${requestId}] Token length: ${data.token.length} characters`);
    
    cookies.set('wp_jwt_token', data.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: AUTH_TOKEN_EXPIRY // 7 days in seconds
    });
    
    console.log(`[AUTH:LOGIN:${requestId}] JWT token cookie set successfully`);
    
    // Return the user data (without the token)
    const successResponse = {
      success: true,
      user: {
        email: data.user_email,
        nicename: data.user_nicename,
        displayName: data.user_display_name
      }
    };
    
    console.log(`[AUTH:LOGIN:${requestId}] Login successful for user: ${data.user_nicename}`);
    console.log(`[AUTH:LOGIN:${requestId}] Returning success response:`, JSON.stringify(successResponse, null, 2));
    
    return json(successResponse);
  } catch (error) {
    console.error(`[AUTH:LOGIN:${requestId}] Login error:`, error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[AUTH:LOGIN:${requestId}] Error name: ${error.name}`);
      console.error(`[AUTH:LOGIN:${requestId}] Error message: ${error.message}`);
      console.error(`[AUTH:LOGIN:${requestId}] Error stack: ${error.stack}`);
    } else {
      console.error(`[AUTH:LOGIN:${requestId}] Unknown error type:`, typeof error);
    }
    
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
      status: 500
    };
    
    console.log(`[AUTH:LOGIN:${requestId}] Returning error response:`, JSON.stringify(errorResponse, null, 2));
    return json(errorResponse, { status: 500 });
  } finally {
    console.log(`[AUTH:LOGIN:${requestId}] Request processing completed`);
  }
};
