import { json } from '@sveltejs/kit';
import type { UserMetaResponse, UserMetaError } from '$lib/types/api';

export async function GET({ params, locals, fetch }) {
  console.log('GET request received for user meta', { params });

  try {
    if (!locals.isAuthenticated) {
      console.error('User not authenticated');
      return json(
        {
          error: true,
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Ensure user can only access their own data
    if (params.userId !== locals.userId) {
      console.error('User attempting to access unauthorized data');
      return json(
        {
          error: true,
          message: 'Unauthorized access'
        },
        { status: 403 }
      );
    }

    console.log('User authenticated and authorized');

    // Use direct WordPress API URL
    const url = `http://localhost:80/wp-json/tributestream/v1/user-meta/${params.userId}`;
    console.log('Fetching user meta from URL:', url);

    // Make the fetch request with token from locals
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${locals.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Response received from external API', { status: response.status, statusText: response.statusText });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as UserMetaError;
      console.error('Error fetching user meta:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      // Match WordPress error codes
      switch(errorData.code) {
        case 'user_not_found':
          return json({ error: true, message: 'User not found' }, { status: 404 });
        case 'db_query_failed':
          return json({ error: true, message: 'Database error' }, { status: 500 });
        case 'no_meta_found':
          return json({ error: true, message: 'No meta data found' }, { status: 404 });
        default:
          return json(
            {
              error: true,
              message: errorData.message || `Failed to fetch user meta: ${response.statusText}`
            },
            { status: response.status }
          );
      }
    }

    // Parse the JSON response
    const data = await response.json() as UserMetaResponse;
    console.log('Parsed JSON data:', data);

    // Check if the API response indicates success
    if (!data.success) {
      console.error('User meta API responded with success:false', data);
      return json(
        {
          error: true,
          message: 'Failed to fetch user meta'
        },
        { status: 400 }
      );
    }

    console.log('User meta fetched successfully');

    // Return the properly typed response
    return json(data);
  } catch (error) {
    console.error('Exception caught in GET user meta handler:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
