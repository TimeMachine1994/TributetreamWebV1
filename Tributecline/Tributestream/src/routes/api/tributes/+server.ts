import { json } from '@sveltejs/kit';
import type { Tribute, PaginatedResponse } from '$lib/types/api';
import { wpFetch, ApiError } from '$lib/utils/api';

export async function GET({ url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const per_page = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    
    try {
      const data = await wpFetch<PaginatedResponse<Tribute>>(
        `/tributes?page=${page}&per_page=${per_page}&search=${search}`
      );
      return json({ success: true, ...data });
    } catch (error) {
      console.error('WordPress tributes fetch error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Failed to fetch tributes'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Tributes GET endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred while fetching tributes'
      }, 
      { status: 500 }
    );
  }
}

export async function POST({ request }) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return json(
        { 
          error: true,
          message: 'Authorization token is required'
        }, 
        { status: 401 }
      );
    }

    try {
      const data = await request.json();
      const result = await wpFetch<{ id: number }>(
        '/tributes',
        {
          method: 'POST',
          headers: {
            Authorization: token
          },
          body: JSON.stringify(data)
        }
      );

      return json({ success: true, id: result.id }, { status: 201 });
    } catch (error) {
      console.error('WordPress tribute creation error:', error);
      return json(
        { 
          error: true, 
          message: error instanceof Error ? error.message : 'Failed to create tribute'
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Tributes POST endpoint error:', error);
    return json(
      { 
        error: true, 
        message: 'An unexpected error occurred while creating tribute'
      }, 
      { status: 500 }
    );
  }
}
