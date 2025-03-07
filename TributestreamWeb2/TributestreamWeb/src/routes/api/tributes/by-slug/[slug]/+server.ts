import { json } from '@sveltejs/kit';

interface Tribute {
  id: number;
  title: string;
  content: string;
  status: string;
  date: string;
  loved_one_name?: string;
  custom_html?: string | null;
  // Add other tribute properties as needed
}

export async function GET({ params }) {
  console.log('[Api-tributes-slug] GET called with params:', params);
  try {
    console.log('[Api-tributes-slug] Fetching tribute for slug:', params.slug);
    const response = await fetch(
      `https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${params.slug}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('[Api-tributes-slug] Received response with status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Api-tributes-slug] Tribute fetch by slug failed:', {
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
    console.log('[Api-tributes-slug] Successfully fetched tribute data:', data);
    return json(data);
  } catch (error) {
    console.error('[Api-tributes-slug] Tribute fetch by slug error:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
