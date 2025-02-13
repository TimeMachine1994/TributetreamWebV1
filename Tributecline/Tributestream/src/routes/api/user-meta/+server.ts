import { json } from '@sveltejs/kit';
import { wpFetch, ApiError } from '$lib/utils/api';

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
      const result = await wpFetch<{ success: boolean; message: string }>(
        '/user-meta',
        {
          method: 'POST',
          headers: {
            Authorization: token
          },
          body: JSON.stringify(data)
        }
      );

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
