import { json } from '@sveltejs/kit';
import type { UserMeta } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ params, request }) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const data = await wpFetch<{ success: boolean; meta: UserMeta[] }>(
      `/user-meta/${params.userId}`,
      {
        headers: {
          Authorization: token
        }
      }
    );

    if (!data.success) {
      return json({ error: 'Failed to fetch user meta' }, { status: 400 });
    }

    return json(data);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
