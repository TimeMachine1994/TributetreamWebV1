import { json } from '@sveltejs/kit';
import type { UserMeta } from '$lib/types/api';
import { getServerApiUrl, WP_ENDPOINTS } from '$lib/config/wordpress.server';

export async function GET({ params, request, fetch }) {
  console.log('GET request received for user meta', { params });

  try {
    // Log the authorization header presence (but avoid logging the full token)
    const token = request.headers.get('Authorization');
    if (!token) {
      console.error('Authorization token is missing in the request headers');
      return json(
        {
          error: true,
          message: 'Authorization token is required'
        },
        { status: 401 }
      );
    }
    console.log('Authorization token found (not logging sensitive details)');

    // Build and log the API URL
    const url = getServerApiUrl(`${WP_ENDPOINTS.API.USER_META}/${params.userId}`);
    console.log('Fetching user meta from URL:', url);

    // Make the fetch request
    const response = await fetch(url, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    console.log('Response received from external API', { status: response.status, statusText: response.statusText });

    // Handle non-OK responses with detailed logging
    if (!response.ok) {
      const errorData = await response.json().catch((err) => {
        console.error('Failed to parse error response JSON:', err);
        return {};
      });
      console.error('Error fetching user meta:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return json(
        {
          error: true,
          message: errorData.message || `Failed to fetch user meta: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    // Parse the JSON response
    const data = await response.json().catch((err) => {
      console.error('Error parsing JSON from response:', err);
      throw new Error('Invalid JSON response from the user meta API');
    });
    console.log('Parsed JSON data:', data);

    // Check if the API response indicates success
    if (!data.success) {
      console.error('User meta API responded with success:false', data);
      return json(
        { 
          error: true,
          message: 'Failed to fetch user meta'
        }, 
        { status: 400 }
      );
    }

    console.log('User meta fetched successfully');
    return json(data);
  } catch (error) {
    console.error('Exception caught in GET user meta handler:', error);
    return json(
      { 
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}
