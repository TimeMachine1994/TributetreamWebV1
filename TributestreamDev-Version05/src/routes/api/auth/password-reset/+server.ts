import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { JWT_AUTH_URL } from '$lib/utils/env';

/**
 * Password reset request handler
 * 
 * This endpoint handles password reset requests and forwards them to the WordPress REST API.
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the request body
    const { email } = await request.json();
    
    // Make the password reset request to the WordPress REST API
    const response = await fetch(`${JWT_AUTH_URL}/wp/v2/users/lostpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      // Return the error response
      return json({
        success: false,
        message: data.message || 'Password reset request failed',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the success response
    return json({
      success: true,
      message: data.message || 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Password reset request failed',
      status: 500
    }, { status: 500 });
  }
};