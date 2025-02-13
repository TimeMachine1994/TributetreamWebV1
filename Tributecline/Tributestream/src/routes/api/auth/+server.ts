import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Handles authentication requests including login and token validation
 */
export async function POST({ request, url }) {
  try {
    const endpoint = url.searchParams.get('action');
    
    // Handle token validation
    if (endpoint === 'validate') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json(
          { 
            error: true,
            message: 'No token provided'
          },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      try {
        const response = await fetch(`${env.WP_API_BASE}/jwt-auth/v1/token/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Token validation failed:', {
            status: response.status,
            statusText: response.statusText
          });
          return json(
            { 
              error: true,
              message: 'Token validation failed'
            },
            { status: response.status }
          );
        }

        const data = await response.json();
        return json({
          code: 'jwt_auth_valid_token',
          data: { status: 200 }
        });
      } catch (error) {
        console.error('Token validation error:', error);
        return json(
          { 
            error: true,
            message: 'Invalid token'
          },
          { status: 401 }
        );
      }
    }

    // Handle login
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
      const response = await fetch(`${env.WP_API_BASE}/jwt-auth/v1/token`, {
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
        return json(
          { 
            error: true,
            message: errorData.message || 'Authentication failed'
          },
          { status: response.status }
        );
      }

      const result = await response.json();

      return json({
        token: result.token,
        user_email: result.user_email,
        user_nicename: result.user_nicename,
        user_display_name: result.user_display_name
      });
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
