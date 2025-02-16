import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WORDPRESS_API_URL = 'http://localhost:80/wp-json';
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json(
        { 
          error: 'Username and password are required' 
        }, 
        { status: 400 }
      );
    }

    // Make request to WordPress JWT auth endpoint
    const response = await fetch(`${WORDPRESS_API_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { 
          error: data.message || 'Authentication failed' 
        }, 
        { status: response.status }
      );
    }

    // Return successful response with token and user data
    return json({
      token: data.token,
      user: {
        email: data.user_email,
        displayName: data.user_display_name,
        nicename: data.user_nicename
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return json(
      { 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
};

// Validate token endpoint
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return json(
        { 
          error: 'No token provided' 
        }, 
        { status: 401 }
      );
    }

    // Make request to WordPress JWT token validation endpoint
    const response = await fetch(`${WORDPRESS_API_URL}/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        { 
          error: data.message || 'Token validation failed' 
        }, 
        { status: response.status }
      );
    }

    return json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    return json(
      { 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
};