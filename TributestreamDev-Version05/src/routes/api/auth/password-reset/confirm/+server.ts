import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';

/**
 * Password reset confirmation handler
 * 
 * This endpoint handles password reset confirmations and forwards them to the WordPress REST API.
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the request body
    const { key, login, password } = await request.json();
    
    // Make the password reset confirmation request to the WordPress REST API
    const response = await fetch(`${JWT_AUTH_URL}/wp/v2/users/resetpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, login, password })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      // Return the error response
      return json({
        success: false,
        message: data.message || 'Password reset failed',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the success response
    return json({
      success: true,
      message: data.message || 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
      status: 500
    }, { status: 500 });
  }
};