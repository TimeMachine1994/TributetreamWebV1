import { json } from '@sveltejs/kit';
import { validateToken } from '$lib/utils/api.server';
import { WordPressApiError } from '$lib/config/wordpress.server';

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
      // Validate token using our server-side API utility
      const isValid = await validateToken(token);

      if (!isValid) {
        return json(
          {
            error: true,
            message: 'Invalid token'
          },
          { status: 401 }
        );
      }

      return json({
        code: 'jwt_auth_valid_token',
        data: { status: 200 }
      });
    } catch (error) {
      // Handle specific WordPress API errors
      if (error instanceof WordPressApiError) {
        console.error('WordPress API Error:', {
          code: error.code,
          message: error.message,
          status: error.status
        });

        return json(
          {
            error: true,
            message: error.message,
            code: error.code
          },
          { status: error.status }
        );
      }

      // Handle unexpected errors
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