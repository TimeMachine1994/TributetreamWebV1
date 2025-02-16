import { json } from '@sveltejs/kit';
import type { Tribute } from '$lib/types/api';

export async function GET({ params }) {
  try {
    const response = await fetch(
      `http://localhost:80/wp-json/tributestream/v1/tributes/${params.id}`,
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

export async function PUT({ params, request }) {
  try {
    const data = await request.json();
    const response = await fetch(
      `http://localhost:80/wp-json/tributestream/v1/tributes/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Tribute update failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to update tribute: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return json(result);
  } catch (error) {
    console.error('Tribute update error:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE({ params }) {
  try {
    const response = await fetch(
      `http://localhost:80/wp-json/tributestream/v1/tributes/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Tribute deletion failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to delete tribute: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return json(result);
  } catch (error) {
    console.error('Tribute deletion error:', error);
    return json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
