import { json } from '@sveltejs/kit';

const PUBLIC_WORDPRESS_URL = 'https://wp.tributestream.com';

/**
 * Token validation endpoint
 * Validates JWT tokens against the WordPress API
 * @route POST /api/validate-token
 */
export async function POST({ request }) {
  try {
    // Extract token from Authorization header
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
      // Validate token directly with WordPress
      const response = await fetch(`${PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return json(
          {
            error: true,
            message: errorData.message || 'Invalid token',
            code: errorData.code || 'jwt_auth_invalid_token'
          },
          { status: response.status }
        );
      }

      // Token is valid
      return json({
        code: 'jwt_auth_valid_token',
        data: { status: 200 }
      });
    } catch (error) {
      // Handle WordPress API errors
      console.error('WordPress API Error:', error);
      return json(
        {
          error: true,
          message: error instanceof Error ? error.message : 'Token validation failed',
          code: 'jwt_auth_invalid_token'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    // Handle any other unexpected errors
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