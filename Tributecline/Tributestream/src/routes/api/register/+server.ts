import { json } from '@sveltejs/kit';
import type { RegisterData } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function POST({ request }) {
  try {
    const data = await request.json() as RegisterData;
    
    // Basic validation
    if (!data.username || !data.email || !data.password) {
      return json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    const result = await wpFetch<{ user_id: number }>(
      '/register',
      {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          meta: data.meta
        })
      }
    );

    return json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
