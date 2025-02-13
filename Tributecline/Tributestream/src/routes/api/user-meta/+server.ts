import { json } from '@sveltejs/kit';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function POST({ request }) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return json({ error: 'Authorization token is required' }, { status: 401 });
    }

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
    return json(result);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
