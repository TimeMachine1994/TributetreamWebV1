import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';
import { env } from '$env/dynamic/private';

export async function GET({ params }) {
  try {
    const response = await fetch(
      `${env.WP_API_BASE}/${env.WP_API_NAMESPACE}/tribute/${params.slug}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Tribute fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to fetch tribute: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json() as Tribute;
    if (!data) {
      return json(
        {
          error: true,
          message: 'Tribute not found'
        },
        { status: 404 }
      );
    }

    return json(data);
  } catch (error) {
    console.error('Tribute fetch error:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
