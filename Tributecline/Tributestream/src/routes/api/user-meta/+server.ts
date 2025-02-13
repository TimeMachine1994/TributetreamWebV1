import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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
        `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/user-meta`,
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
