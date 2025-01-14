export async function POST({ request, cookies }) {
    try {
      // Extract data from the incoming request body
      const body = await request.json();
  
      // Extract the JWT token from cookies
      const jwtToken = cookies.get('jwt_token');
      if (!jwtToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Missing JWT token' }), { status: 403 });
      }
  
      // Make the request to the WordPress REST API
      const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      });
  
      // Process and return the response
      const responseData = await response.json();
  
      if (!response.ok) {
        return new Response(JSON.stringify({ error: responseData }), { status: response.status });
      }
  
      return new Response(JSON.stringify(responseData), { status: 200 });
    } catch (error) {
      console.error('Error in API call:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }
  

 