import { json } from '@sveltejs/kit';
import type { Tribute, PaginatedResponse } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ url }) {
  const page = url.searchParams.get('page') || '1';
  const per_page = url.searchParams.get('per_page') || '10';
  const search = url.searchParams.get('search') || '';
  
  try {
    const data = await wpFetch<PaginatedResponse<Tribute>>(
      `/tributes?page=${page}&per_page=${per_page}&search=${search}`
    );
    return json(data);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const result = await wpFetch<{ success: boolean; id: number }>('/tributes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
