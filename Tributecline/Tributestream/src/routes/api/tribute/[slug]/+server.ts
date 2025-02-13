import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ params }) {
  try {
    const data = await wpFetch<Tribute>(`/tribute/${params.slug}`);
    if (!data) {
      return json({ error: 'Tribute not found' }, { status: 404 });
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
