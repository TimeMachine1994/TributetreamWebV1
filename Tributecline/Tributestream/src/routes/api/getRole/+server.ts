import { json } from '@sveltejs/kit';
import type { UserRole } from '$lib/types/api';
import { env } from '$env/dynamic/private';

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  if (!id) {
    console.error('getRole: Missing user ID in request');
    return json(
      { 
        error: true,
        message: 'User ID is required'
      },
      { status: 400 }
    );
  }

  console.log('getRole: Fetching role for user ID:', id);
  
  try {
    const response = await fetch(
      `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/getRole?id=${id}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Role fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to fetch role: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json() as UserRole;
    
    // Validate response data structure
    if (!data || typeof data.user_id !== 'number' || !Array.isArray(data.roles)) {
      console.error('getRole: Invalid response structure:', data);
      return json(
        {
          error: true,
          message: 'Invalid role data structure received'
        },
        { status: 500 }
      );
    }

    // Validate user ID matches
    if (data.user_id !== parseInt(id)) {
      console.error('getRole: User ID mismatch:', { requested: id, received: data.user_id });
      return json(
        {
          error: true,
          message: 'User ID mismatch in role data'
        },
        { status: 500 }
      );
    }

    // Ensure roles is never empty
    if (data.roles.length === 0) {
      data.roles = ['subscriber'];
    }

    console.log('getRole: Successfully fetched role data for user:', id);
    return json(data);
  } catch (error) {
    console.error('getRole: Error fetching role data:', {
      userId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return json(
      {
        error: true,
        message: 'Failed to fetch user role data'
      },
      { status: 500 }
    );
  }
}
