import { json } from '@sveltejs/kit';
import type { Tribute, PaginatedResponse } from '$lib/types/api';
import { env } from '$env/dynamic/private';

export async function GET({ url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const per_page = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    
    try {
      const response = await fetch(
        `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/tributes?page=${page}&per_page=${per_page}&search=${search}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Tributes fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || `Failed to fetch tributes: ${response.statusText}`
          },
          { status: response.status }
        );
      }

      const data = await response.json() as PaginatedResponse<Tribute>;
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
      const response = await fetch(
        `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/tributes`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Tribute creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || `Failed to create tribute: ${response.statusText}`
          },
          { status: response.status }
        );
      }

      const result = await response.json();
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
