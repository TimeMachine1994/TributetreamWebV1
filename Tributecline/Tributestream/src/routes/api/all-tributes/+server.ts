import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET() {
  try {
    const data = await wpFetch<{ tributes: Tribute[] }>('/all-tributes');
    return json(data);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
