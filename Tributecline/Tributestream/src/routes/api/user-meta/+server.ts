import { json } from '@sveltejs/kit';

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
      // Parse the incoming JSON request body
      const data = await request.json();
      console.log('Request body parsed successfully:', data);

      // Use direct WordPress URL
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

      // Check for non-OK response statuses
      if (!response.ok) {
        const errorData = await response.json().catch((err) => {
          console.error('Failed to parse error response JSON:', err);
          return {};
        });
        console.error('User-meta update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return json(
          {
            error: true,
            message: errorData.message || `Failed to save user metadata: ${response.statusText}`
          },
          { status: response.status }
        );
      }

      // Parse the successful response
      const result = await response.json().catch((err) => {
        console.error('Error parsing JSON from success response:', err);
        throw new Error('Invalid JSON response from the user meta API');
      });
      console.log('User meta updated successfully:', result);

      return json({ success: true, message: result.message });
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
