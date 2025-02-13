import { json } from '@sveltejs/kit';
import type { UserMeta } from '$lib/types/api';
import { env } from '$env/dynamic/private';

export async function GET({ params, request }) {
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

    const response = await fetch(
      `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/user-meta/${params.userId}`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('User meta fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to fetch user meta: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      return json(
        { 
          error: true,
          message: 'Failed to fetch user meta'
        }, 
        { status: 400 }
      );
    }

    return json(data);
  } catch (error) {
    console.error('User meta fetch error:', error);
    return json(
      { 
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}
