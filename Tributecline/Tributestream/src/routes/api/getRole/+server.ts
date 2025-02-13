import { json } from '@sveltejs/kit';
import type { UserRole } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  if (!id) {
    return json({ error: 'User ID is required' }, { status: 400 });
  }
  
  try {
    const data = await wpFetch<UserRole>(`/getRole?id=${id}`);
    return json(data);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
