import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';

export async function GET() {
  try {
    const response = await fetch(
      'http://localhost:80/wp-json/tributestream/v1/all-tributes',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('All tributes fetch failed:', {
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

    const data = await response.json() as { tributes: Tribute[] };
    return json(data);
  } catch (error) {
    console.error('All tributes fetch error:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
