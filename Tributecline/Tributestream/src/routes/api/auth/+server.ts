import { json } from '@sveltejs/kit';
import { wpFetch, ApiError, WP_API_BASE } from '$lib/utils/api';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.username || !data.password) {
      return json(
        { 
          error: true,
          message: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    try {
      // JWT auth endpoint is at WordPress base URL, not under our custom namespace
      const response = await fetch(`${WP_API_BASE}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Authentication failed'
        );
      }

      const result = await response.json();

      return json({ success: true, token: result.token });
    } catch (error) {
      console.error('WordPress authentication error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Authentication failed'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Authentication endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred during authentication'
      }, 
      { status: 500 }
    );
  }
}
