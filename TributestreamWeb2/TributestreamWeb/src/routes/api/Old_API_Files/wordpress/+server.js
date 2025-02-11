// src/routes/api/wordpress/+server.js
import { error, json } from '@sveltejs/kit';

const WP_API_BASE = 'https://wp.tributestream.com/wp-json/tributestream/v1';

export async function GET({ fetch, url, cookies }) {
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    throw error(401, 'No authentication token found');
  }

  try {
    const response = await fetch(`${WP_API_BASE}/tributes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw error(response.status, 'WordPress API error');
    }

    const data = await response.json();
    return json(data);
  } catch (e) {
    console.error('Fetch error:', e);
    throw error(500, e.message);
  }
}

export async function PUT({ fetch, request, params, cookies }) {
  try {
    const { tributeId } = params;
    const data = await request.json();
    
    const response = await fetch(
      `${WP_API_BASE}/tributes/${tributeId}/custom-html`,
      {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${cookies.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) throw new Error('Failed to update tribute');
    const result = await response.json();
    return json(result);
  } catch (e) {
    console.error('Error updating tribute:', e);
    throw error(500, 'Failed to update tribute');
  }
}