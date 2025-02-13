import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ params }) {
  try {
    const data = await wpFetch<Tribute>(`/tributes/${params.id}`);
    return json(data);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function PUT({ params, request }) {
  try {
    const data = await request.json();
    const result = await wpFetch<{ success: boolean }>(`/tributes/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return json(result);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const result = await wpFetch<{ success: boolean }>(`/tributes/${params.id}`, {
      method: 'DELETE'
    });
    return json(result);
  } catch (error) {
    if (error instanceof Error) {
      const status = error instanceof ApiError ? error.status : 500;
      return json({ error: error.message }, { status });
    }
    return json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
