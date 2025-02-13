import { json } from '@sveltejs/kit';
import type { UserRole } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  if (!id) {
    console.error('getRole: Missing user ID in request');
    return json({ error: 'User ID is required' }, { status: 400 });
  }

  console.log('getRole: Fetching role for user ID:', id);
  
  try {
    const data = await wpFetch<UserRole>(`/getRole?id=${id}`);
    
    // Validate response data structure
    if (!data || typeof data.user_id !== 'number' || !Array.isArray(data.roles)) {
      console.error('getRole: Invalid response structure:', data);
      throw new ApiError(500, 'Invalid role data structure received');
    }

    // Validate user ID matches
    if (data.user_id !== parseInt(id)) {
      console.error('getRole: User ID mismatch:', { requested: id, received: data.user_id });
      throw new ApiError(500, 'User ID mismatch in role data');
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

    if (error instanceof ApiError) {
      return json(
        { error: error.message },
        { status: error.status }
      );
    }

    return json(
      { error: 'Failed to fetch user role data' },
      { status: 500 }
    );
  }
}
