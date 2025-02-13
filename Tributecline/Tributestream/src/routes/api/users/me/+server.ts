import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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
      const response = await fetch(`${env.WP_API_BASE}/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('User data fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || `Failed to fetch user data: ${response.statusText}`
          },
          { status: response.status }
        );
      }

      const userData = await response.json();
      
      // Validate required fields
      if (!userData.id || !userData.username || !userData.email) {
        console.error('Invalid user data response:', userData);
        return json(
          {
            error: true,
            message: 'Invalid user data structure received from WordPress'
          },
          { status: 500 }
        );
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