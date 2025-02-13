import { json } from '@sveltejs/kit';
import { wpFetch, ApiError, WP_API_BASE } from '$lib/utils/api';

export async function GET({ request }) {
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
      const response = await fetch(`${WP_API_BASE}/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('User data fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new ApiError(
          response.status,
          errorData.message || `Failed to fetch user data: ${response.statusText}`
        );
      }

      const userData = await response.json();
      
      // Validate required fields
      if (!userData.id || !userData.username || !userData.email) {
        console.error('Invalid user data response:', userData);
        throw new ApiError(500, 'Invalid user data structure received from WordPress');
      }
      
      // Return only the necessary user data
      return json({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name || userData.username,
        roles: userData.roles || ['subscriber']
      });
    } catch (error) {
      console.error('User data fetch error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof ApiError) {
        return json(
          {
            error: true,
            message: error.message
          },
          { status: error.status }
        );
      }

      return json(
        {
          error: true,
          message: 'An unexpected error occurred while fetching user data'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Users/me endpoint error:', error);
    return json(
      { 
        error: true,
        message: 'An unexpected error occurred while fetching user data'
      },
      { status: 500 }
    );
  }
}