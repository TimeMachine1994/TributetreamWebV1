import { json } from '@sveltejs/kit';
import type { UserMeta } from '$lib/types/api';

export async function GET({ params, locals, fetch }) {
  console.log('GET request received for user meta', { params });

  try {
    if (!locals.isAuthenticated) {
      console.error('User not authenticated');
      return json(
        {
          error: true,
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Ensure user can only access their own data
    if (params.userId !== locals.userId) {
      console.error('User attempting to access unauthorized data');
      return json(
        {
          error: true,
          message: 'Unauthorized access'
        },
        { status: 403 }
      );
    }

    console.log('User authenticated and authorized');

    // Use direct WordPress URL
    const url = `http://localhost:80/wp-json/tributestream/v1/user-meta/${params.userId}`;
    console.log('Fetching user meta from URL:', url);

    // Make the fetch request with token from locals
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${locals.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Response received from external API', { status: response.status, statusText: response.statusText });

    // Handle non-OK responses with detailed logging
    if (!response.ok) {
      // Try to get the response text first
      const responseText = await response.text();
      let errorMessage = `Failed to fetch user meta: ${response.statusText}`;
      let errorData: { message?: string } = {};

      // Try to parse as JSON if it looks like JSON
      if (responseText.trim().startsWith('{')) {
        try {
          errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (err) {
          console.error('Failed to parse error response as JSON:', err);
        }
      }

      // Log the error details
      console.error('Error fetching user meta:', {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 200) // Log first 200 chars to avoid huge logs
      });

      // Return appropriate error response
      if (response.status === 404) {
        return json(
          {
            error: true,
            message: `User meta not found for user ID: ${params.userId}`
          },
          { status: 404 }
        );
      }

      return json(
        {
          error: true,
          message: errorMessage
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
    
    // Transform and validate the response data
    const transformedData = {
      meta_key: data.meta_key || '',
      meta_value: typeof data.meta_value === 'string' ? data.meta_value : JSON.stringify(data.meta_value),
      user_id: parseInt(params.userId),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };

    return json(transformedData);
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
