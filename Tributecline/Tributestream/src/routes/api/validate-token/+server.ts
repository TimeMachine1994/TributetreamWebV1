import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
  try {
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Token validation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || 'Token validation failed'
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
  } catch (error) {
    console.error('Validate token endpoint error:', error);
    return json(
      { 
        error: true,
        message: 'An unexpected error occurred during token validation'
      },
      { status: 500 }
    );
  }
}