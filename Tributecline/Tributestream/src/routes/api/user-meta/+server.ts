import { json } from '@sveltejs/kit';
import type { UserMetaCreateRequest, UserMetaError } from '$lib/types/api';

export async function POST({ request, fetch }) {
  console.log('POST request received for updating user meta');
  try {
    // Extract and verify the authorization token
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

    try {
      // Parse and validate the incoming JSON request body
      const data = await request.json() as UserMetaCreateRequest;
      if (!data.meta_key || !data.meta_value) {
        return json(
          {
            error: true,
            message: 'meta_key and meta_value are required'
          },
          { status: 400 }
        );
      }
      console.log('Request body parsed and validated successfully:', data);

      // Use direct WordPress API URL
      const apiUrl = 'http://localhost:80/wp-json/tributestream/v1/user-meta';
      console.log('Sending POST request to external API URL:', apiUrl);

      // Ensure token has 'Bearer ' prefix
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      // Perform the fetch to update user meta on the external API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log('Response received from external API', { status: response.status, statusText: response.statusText });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as UserMetaError;
        console.error('User-meta update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Match WordPress error codes
        switch(errorData.code) {
          case 'meta_update_failed':
            return json(
              {
                error: true,
                message: 'Failed to update meta data'
              },
              { status: 500 }
            );
          default:
            return json(
              {
                error: true,
                message: errorData.message || `Failed to save user metadata: ${response.statusText}`
              },
              { status: response.status }
            );
        }
      }

      // Parse the successful response
      const result = await response.json().catch((err) => {
        console.error('Error parsing JSON from success response:', err);
        throw new Error('Invalid JSON response from the user meta API');
      });
      console.log('User meta updated successfully:', result);

      return json({
        success: true,
        message: result.message,
        user_id: result.user_id,
        meta_key: result.meta_key,
        meta_value: result.meta_value
      });
    } catch (error) {
      console.error('WordPress user-meta error during POST processing:', error);
      return json(
        {
          error: true,
          message: error instanceof Error ? error.message : 'Failed to save user metadata'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('User-meta endpoint unexpected error:', error);
    return json(
      {
        error: true,
        message: 'An unexpected error occurred while saving user metadata'
      },
      { status: 500 }
    );
  }
}
