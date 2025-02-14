import { json } from '@sveltejs/kit';
import { getServerApiUrl, WP_ENDPOINTS, type WPApiError } from '$lib/config/wordpress.server';

export async function POST({ request }) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return json(
        {
          error: true,
          message: 'Authorization token is required'
        },
        { status: 401 }
      );
    }

    try {
      const data = await request.json();
      const response = await fetch(
        getServerApiUrl(WP_ENDPOINTS.API.USER_META),
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('User-meta update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || `Failed to save user metadata: ${response.statusText}`
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      return json({ success: true, message: result.message });
    } catch (error) {
      console.error('WordPress user-meta error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Failed to save user metadata'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('User-meta endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred while saving user metadata'
      }, 
      { status: 500 }
    );
  }
}
